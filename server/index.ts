import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { SocketEvents, CONFIG } from '../shared/types';
import { GameRoom } from './game/GameRoom';

const app = express();
const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'] 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// ─── Room Management ───
const rooms = new Map<string, GameRoom>();
const playerRooms = new Map<string, string>(); // socketId -> roomCode

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
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

// ─── Socket Event Handlers ───

io.on('connection', (socket: Socket) => {
  console.log(`Player connected: ${socket.id}`);

  // ─── Create Room ───
  socket.on(SocketEvents.CREATE_ROOM, (data: { playerName: string }, callback: any) => {
    const code = generateRoomCode();
    const room = new GameRoom(code);
    const playerId = uuidv4();
    room.addPlayer(playerId, data.playerName, socket.id);
    rooms.set(code, room);
    playerRooms.set(socket.id, code);

    socket.join(code);

    // Set up room callbacks
    room.onStateUpdate = () => broadcastState(room);
    room.onSnapWindowClose = () => {
      io.to(code).emit(SocketEvents.SNAP_WINDOW_CLOSED);
      broadcastState(room);
    };

    callback({ success: true, roomCode: code, playerId });
    broadcastState(room);
  });

  // ─── Join Room ───
  socket.on(SocketEvents.JOIN_ROOM, (data: { roomCode: string; playerName: string }, callback: any) => {
    const room = rooms.get(data.roomCode.toUpperCase());
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }
    if (room.phase !== 'WAITING') {
      callback({ success: false, error: 'Game already in progress' });
      return;
    }

    const playerId = uuidv4();
    const player = room.addPlayer(playerId, data.playerName, socket.id);
    if (!player) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    playerRooms.set(socket.id, data.roomCode.toUpperCase());
    socket.join(data.roomCode.toUpperCase());

    callback({ success: true, roomCode: room.code, playerId });
    io.to(room.code).emit(SocketEvents.PLAYER_JOINED, { playerName: data.playerName, playerId });
    broadcastState(room);
  });

  // ─── Start Game ───
  socket.on(SocketEvents.START_GAME, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false, error: 'Not in a room' });
    if (player.id !== room.hostId) return callback?.({ success: false, error: 'Only host can start' });

    const started = room.startGame();
    if (!started) return callback?.({ success: false, error: 'Need at least 2 players' });

    callback?.({ success: true });
    io.to(room.code).emit(SocketEvents.GAME_STARTED);
    broadcastState(room);
  });

  // ─── Peek Initial Card (Memorize Phase) ───
  socket.on(SocketEvents.PEEK_INITIAL, (data: { cardIndex: number }, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const card = room.peekInitialCard(player.id, data.cardIndex);
    if (!card) return callback?.({ success: false, error: 'Cannot peek this card' });

    callback?.({ success: true, card });
    broadcastState(room);
  });

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
    if (!room || !player) return callback?.({ success: false, error: 'Not your turn' });

    const card = room.drawFromDeck(player.id);
    if (!card) return callback?.({ success: false, error: 'Cannot draw' });

    callback?.({ success: true, card });
  });

  // ─── Draw from Discard ───
  socket.on(SocketEvents.DRAW_FROM_DISCARD, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false, error: 'Not your turn' });

    const card = room.drawFromDiscard(player.id);
    if (!card) return callback?.({ success: false, error: 'Cannot draw from discard' });

    callback?.({ success: true, card });
    broadcastState(room);
  });

  // ─── Keep Drawn Card (Swap) ───
  socket.on(SocketEvents.KEEP_DRAWN_CARD, (data: { swapIndices: number[] }, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const result = room.keepDrawnCard(player.id, data.swapIndices);
    callback?.({ success: result.success, penalized: result.penalized });
    broadcastState(room);
  });

  // ─── Discard Drawn Card ───
  socket.on(SocketEvents.DISCARD_DRAWN_CARD, (_: any, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const result = room.discardDrawnCard(player.id);
    callback?.({ success: !!result.card, actionType: result.actionType });
    if (result.actionType) {
      socket.emit(SocketEvents.ACTION_REQUIRED, { actionType: result.actionType });
    }
    broadcastState(room);
  });

  // ─── Use Action ───
  socket.on(SocketEvents.USE_ACTION, (data: {
    targetPlayerId?: string;
    myCardIndex?: number;
    targetCardIndex?: number;
  }, callback: any) => {
    const { room, player } = getContext(socket);
    if (!room || !player) return callback?.({ success: false });

    const result = room.useAction(player.id, data);
    callback?.({
      success: result.success,
      peekedCard: result.peekedCard,
      actionType: result.actionType,
    });
    broadcastState(room);
  });

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
    if (!success) return callback?.({ success: false, error: 'Cannot call Cabo now' });

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
    callback?.({ success: result.success, card: result.card });
    if (result.success) {
      io.to(room.code).emit(SocketEvents.SNAP_RESULT, {
        playerId: player.id,
        playerName: player.name,
        card: result.card,
      });
      broadcastState(room);
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

  // ─── Disconnect ───
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    const roomCode = playerRooms.get(socket.id);
    if (roomCode) {
      const room = rooms.get(roomCode);
      if (room) {
        const player = room.players.find(p => p.socketId === socket.id);
        if (player) {
          room.removePlayer(player.id);
          io.to(roomCode).emit(SocketEvents.PLAYER_LEFT, { playerId: player.id });
          broadcastState(room);
        }

        // Clean up empty rooms
        if (room.activePlayers.length === 0) {
          rooms.delete(roomCode);
        }
      }
      playerRooms.delete(socket.id);
    }
  });
});

// ─── Helpers ───

function getContext(socket: Socket): { room: GameRoom | null; player: any | null } {
  const roomCode = playerRooms.get(socket.id);
  if (!roomCode) return { room: null, player: null };
  const room = rooms.get(roomCode);
  if (!room) return { room: null, player: null };
  const player = room.players.find(p => p.socketId === socket.id);
  return { room, player: player || null };
}

// ─── Health Check ───
app.get('/health', (_: any, res: any) => res.json({ status: 'ok' }));

// ─── Start Server ───
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Cabo server running on port ${PORT}`);
});
