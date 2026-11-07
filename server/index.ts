import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { SocketEvents, GameSettings } from "../shared/types";
import { GameRoom } from "./game/GameRoom";
import { CONFIG } from "../shared/rules";
import {
  CHAMPIONSHIP_ROOM_CODE,
  CHAMPIONS,
  isChampionId,
} from "../shared/championship";
import { ChampionshipStore } from "./championship/ChampionshipStore";
import { recordChampionshipGames } from "./championship/ChampionshipRecorder";

const app = express();
const championshipStore = new ChampionshipStore(
  process.env.DATA_DIR || path.resolve("data"),
);
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Room Management ───
const rooms = new Map<string, GameRoom>();
const playerRooms = new Map<string, string>(); // socketId -> roomCode

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < CONFIG.ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function broadcastState(room: GameRoom): void {
  for (const player of room.players) {
    const state = room.getStateForPlayer(player.id);
    io.to(player.socketId).emit(SocketEvents.STATE_UPDATE, state);
  }
}

function setupRoomCallbacks(room: GameRoom): void {
  room.onStateUpdate = () => broadcastState(room);
  room.onSnapWindowClose = () => {
    io.to(room.code).emit(SocketEvents.SNAP_WINDOW_CLOSED);
    broadcastState(room);
  };
}

// The championship has one fixed room. A finished game is replaced by a
// fresh room as soon as someone joins again.
function getChampionshipRoom(): GameRoom {
  const existing = rooms.get(CHAMPIONSHIP_ROOM_CODE);
  if (
    existing &&
    existing.phase !== "GAME_OVER" &&
    existing.phase !== "ABANDONED"
  ) {
    return existing;
  }

  if (existing) {
    // Players still looking at the old game no longer receive its events
    for (const p of existing.players) playerRooms.delete(p.socketId);
    io.in(CHAMPIONSHIP_ROOM_CODE).socketsLeave(CHAMPIONSHIP_ROOM_CODE);
  }

  const room = new GameRoom(CHAMPIONSHIP_ROOM_CODE, "championship");
  setupRoomCallbacks(room);
  recordChampionshipGames(room, championshipStore);
  rooms.set(CHAMPIONSHIP_ROOM_CODE, room);
  return room;
}

// ─── Socket Event Handlers ───

io.on("connection", (socket: Socket) => {
  console.log(`Player connected: ${socket.id}`);

  // ─── Create Room ───
  socket.on(
    SocketEvents.CREATE_ROOM,
    (data: { playerName: string }, callback: any) => {
      const code = generateRoomCode();
      const room = new GameRoom(code);
      const playerId = uuidv4();
      room.addPlayer(playerId, data.playerName, socket.id);
      rooms.set(code, room);
      playerRooms.set(socket.id, code);

      socket.join(code);
      setupRoomCallbacks(room);

      callback({ success: true, roomCode: code, playerId });
      broadcastState(room);
    },
  );

  // ─── Join Room ───
  socket.on(
    SocketEvents.JOIN_ROOM,
    (data: { roomCode: string; playerName: string }, callback: any) => {
      const room = rooms.get(data.roomCode.toUpperCase());
      if (!room || room.mode !== "normal") {
        callback({ success: false, error: "Room not found" });
        return;
      }
      if (room.phase !== "WAITING") {
        callback({ success: false, error: "Game already in progress" });
        return;
      }

      const playerId = uuidv4();
      const player = room.addPlayer(playerId, data.playerName, socket.id);
      if (!player) {
        callback({ success: false, error: "Room is full" });
        return;
      }

      playerRooms.set(socket.id, data.roomCode.toUpperCase());
      socket.join(data.roomCode.toUpperCase());

      callback({ success: true, roomCode: room.code, playerId });
      io.to(room.code).emit(SocketEvents.PLAYER_JOINED, {
        playerName: data.playerName,
        playerId,
      });
      broadcastState(room);
    },
  );

  // ─── Join Championship (Fane or Lebo) ───
  socket.on(
    SocketEvents.JOIN_CHAMPIONSHIP,
    (data: { champion: string }, callback: any) => {
      if (!isChampionId(data?.champion))
        return callback?.({ success: false, error: "Choose Fane or Lebo" });

      const champion = CHAMPIONS.find((c) => c.id === data.champion)!;
      const room = getChampionshipRoom();
      const existing = room.getPlayer(champion.id);

      if (existing) {
        if (existing.isConnected)
          return callback?.({
            success: false,
            error: `${champion.name} is already playing`,
          });
        // Same champion coming back (reload, other device): take over the seat
        playerRooms.delete(existing.socketId);
        existing.socketId = socket.id;
        existing.isConnected = true;
      } else if (!room.addPlayer(champion.id, champion.name, socket.id)) {
        return callback?.({
          success: false,
          error: "A championship game is already running",
        });
      }

      playerRooms.set(socket.id, room.code);
      socket.join(room.code);

      callback?.({ success: true, roomCode: room.code, playerId: champion.id });
      broadcastState(room);
    },
  );

  // ─── Start Game ───
  socket.on(SocketEvents.START_GAME, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player)
      return callback?.({ success: false, error: "Not in a room" });
    if (room.mode === "championship") {
      if (room.activePlayers.length < 2)
        return callback?.({ success: false, error: "Waiting for opponent" });
    } else if (player.id !== room.hostId)
      return callback?.({ success: false, error: "Only host can start" });

    const started = room.startGame();
    if (!started)
      return callback?.({ success: false, error: "Need at least 2 players" });

    callback?.({ success: true });
    io.to(room.code).emit(SocketEvents.GAME_STARTED);
    broadcastState(room);
  });

  // ─── Game Settings (waiting room) ───
  socket.on(
    SocketEvents.UPDATE_SETTINGS,
    (data: Partial<GameSettings>, callback: any) => {
      const { room, player } = getContext(socket);
      if (!room || !player)
        return callback?.({ success: false, error: "Not in a room" });
      // In a championship both players may change them, otherwise only the host
      if (room.mode !== "championship" && player.id !== room.hostId)
        return callback?.({ success: false, error: "Only host can change settings" });
      if (!room.updateSettings(data ?? {}))
        return callback?.({ success: false, error: "The game has already started" });
      callback?.({ success: true });
      broadcastState(room);
    },
  );

  // ─── Peek Initial Card (Memorize Phase) ───
  socket.on(
    SocketEvents.PEEK_INITIAL,
    (data: { cardIndex: number }, callback: any) => {
      const { room, player } = getContext(socket);
      if (!room || !player) return callback?.({ success: false });

      const card = room.peekInitialCard(player.id, data.cardIndex);
      if (!card)
        return callback?.({ success: false, error: "Cannot peek this card" });

      callback?.({ success: true, card });
      broadcastState(room);
    },
  );

  // ─── Done Memorizing ───
  socket.on(SocketEvents.DONE_MEMORIZING, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    room.doneMemorazing(player.id);
    callback?.({ success: true });
    broadcastState(room);
  });

  // ─── Draw from Deck ───
  socket.on(SocketEvents.DRAW_FROM_DECK, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player)
      return callback?.({ success: false, error: "Not your turn" });

    const card = room.drawFromDeck(player.id);
    if (!card) return callback?.({ success: false, error: "Cannot draw" });

    callback?.({ success: true, card });
    // The others see that a hidden card was drawn
    broadcastState(room);
  });

  // ─── Draw from Discard ───
  socket.on(SocketEvents.DRAW_FROM_DISCARD, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player)
      return callback?.({ success: false, error: "Not your turn" });

    const card = room.drawFromDiscard(player.id);
    if (!card)
      return callback?.({ success: false, error: "Cannot draw from discard" });

    callback?.({ success: true, card });
    broadcastState(room);
  });

  // ─── Put a card taken from the discard pile back ───
  socket.on(SocketEvents.RETURN_TO_DISCARD, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const success = room.returnToDiscard(player.id);
    callback?.({ success });
    if (success) broadcastState(room);
  });

  // ─── Keep Drawn Card (Swap) ───
  socket.on(
    SocketEvents.KEEP_DRAWN_CARD,
    (data: { swapIndices: number[] }, callback: any) => {
      const { room, player } = getContext(socket);
      if (!room || !player) return callback?.({ success: false });

      const result = room.keepDrawnCard(player.id, data.swapIndices);
      callback?.({ success: result.success, penalized: result.penalized });
      broadcastState(room);
    },
  );

  // ─── Discard Drawn Card ───
  socket.on(SocketEvents.DISCARD_DRAWN_CARD, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const result = room.discardDrawnCard(player.id);
    callback?.({ success: !!result.card, actionType: result.actionType });
    if (result.actionType) {
      socket.emit(SocketEvents.ACTION_REQUIRED, {
        actionType: result.actionType,
      });
    }
    broadcastState(room);
  });

  // ─── Use Action ───
  socket.on(
    SocketEvents.USE_ACTION,
    (
      data: {
        targetPlayerId?: string;
        myCardIndex?: number;
        targetCardIndex?: number;
      },
      callback: any,
    ) => {
      const { room, player } = getContext(socket);
      if (!room || !player) return callback?.({ success: false });

      const result = room.useAction(player.id, data);
      callback?.({
        success: result.success,
        peekedCard: result.peekedCard,
        actionType: result.actionType,
      });
      broadcastState(room);
    },
  );

  // ─── Skip Action ───
  socket.on(SocketEvents.SKIP_ACTION, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const success = room.skipAction(player.id);
    callback?.({ success });
    if (success) broadcastState(room);
  });

  // ─── Call Cabo ───
  socket.on(SocketEvents.CALL_CABO, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const success = room.callCabo(player.id);
    if (!success)
      return callback?.({ success: false, error: "Cannot call Cabo now" });

    callback?.({ success: true });
    io.to(room.code).emit(SocketEvents.CABO_ANNOUNCED, {
      callerId: player.id,
      callerName: player.name,
    });
    broadcastState(room);
  });

  // ─── Snap ───
  socket.on(SocketEvents.SNAP, (data: { cardIndex: number }, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const result = room.snap(player.id, data.cardIndex);
    if (result.success) {
      callback?.({ success: true, card: result.card });
      io.to(room.code).emit(SocketEvents.SNAP_RESULT, {
        playerId: player.id,
        playerName: player.name,
        card: result.card,
      });
      broadcastState(room);
    } else {
      callback?.({ success: false, penaltyApplied: result.penaltyApplied, card: result.card });
      if (result.penaltyApplied) {
        broadcastState(room);
      }
    }
  });

  // ─── Next Round ───
  socket.on(SocketEvents.NEXT_ROUND, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    room.startNextRound();
    callback?.({ success: true });
    broadcastState(room);
  });

  // ─── Leave Game ───
  socket.on(SocketEvents.LEAVE_GAME, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const result = room.leaveGame(player.id);
    socket.leave(room.code);
    playerRooms.delete(socket.id);

    io.to(room.code).emit(SocketEvents.PLAYER_LEFT, {
      playerId: player.id,
      playerName: player.name,
    });

    callback?.({ success: true });
    broadcastState(room);

    // Clean up empty rooms (the championship room is replaced on next join)
    if (room.activePlayers.length === 0 && room.mode === "normal") {
      rooms.delete(room.code);
    }
  });

  // ─── Reconnect Session ───
  socket.on(
    SocketEvents.RECONNECT,
    (data: { roomCode: string; playerId: string }, callback: any) => {
      const room = rooms.get(data.roomCode);
      if (!room) {
        return callback?.({ success: false, error: "Room not found" });
      }

      const player = room.getPlayer(data.playerId);
      if (!player) {
        return callback?.({ success: false, error: "Player not found" });
      }

      // Remove old mapping if exists
      const oldSocketId = player.socketId;
      playerRooms.delete(oldSocketId);

      // Rebind the new socket to the player
      player.socketId = socket.id;
      player.isConnected = true;
      playerRooms.set(socket.id, data.roomCode);
      socket.join(data.roomCode);

      callback?.({ success: true, playerId: player.id });
      broadcastState(room);
    },
  );

  // ─── Disconnect ───
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    const roomCode = playerRooms.get(socket.id);
    if (roomCode) {
      const room = rooms.get(roomCode);
      if (room) {
        const player = room.players.find((p) => p.socketId === socket.id);
        if (player) {
          room.removePlayer(player.id);
          io.to(roomCode).emit(SocketEvents.PLAYER_LEFT, {
            playerId: player.id,
          });
          broadcastState(room);
        }

        // Clean up empty rooms. A championship game survives both players
        // dropping out at once (e.g. both reloading) so it can be resumed.
        if (room.activePlayers.length === 0 && room.mode === "normal") {
          rooms.delete(roomCode);
        }
      }
      playerRooms.delete(socket.id);
    }
  });
});

// ─── Helpers ───

function getContext(socket: Socket): {
  room: GameRoom | null;
  player: any | null;
} {
  const roomCode = playerRooms.get(socket.id);
  if (!roomCode) return { room: null, player: null };
  const room = rooms.get(roomCode);
  if (!room) return { room: null, player: null };
  const player = room.players.find((p) => p.socketId === socket.id);
  return { room, player: player || null };
}

// ─── Health Check ───
app.get("/health", (_: any, res: any) => res.json({ status: "ok" }));

// ─── Championship API ───
app.get("/api/championship", (req: any, res: any) => {
  const season = req.query.season ? Number(req.query.season) : undefined;
  const response = championshipStore.getResponse(season);
  if (!response) return res.status(404).json({ error: "Season not found" });
  res.json(response);
});

// JSON body required: forces a CORS preflight, so other sites cannot trigger it
app.post("/api/championship/reset", express.json(), (req: any, res: any) => {
  if (req.body?.confirm !== "RESET")
    return res.status(400).json({ error: "Confirmation missing" });
  const season = championshipStore.reset();
  res.json({ season });
});

// ─── Start Server ───
// Docker: the built client is served by this server (same origin, no CORS).
const STATIC_DIR = process.env.STATIC_DIR;
if (STATIC_DIR) {
  app.use(express.static(STATIC_DIR));
  app.get("*", (_: any, res: any) =>
    res.sendFile(path.join(STATIC_DIR, "index.html")),
  );
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Cabo server running on port ${PORT}`);
});
