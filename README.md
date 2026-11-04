# Cabo

A real-time multiplayer card game built with React and Socket.IO. Play the classic [Cabo card game](https://en.wikipedia.org/wiki/Cabo_(game)) online with friends.

🎮 **Live at** [playcabo.vercel.app](https://playcabo.vercel.app)

## How to Play

- Each player starts with **4 face-down cards** and peeks at 2 of them.
- On your turn, draw from the **deck** or **discard pile**, then swap or discard.
- Special cards (7–12) grant abilities: **Peek**, **Spy**, **Swap**.
- Call **"Cabo!"** when you think you have the lowest hand — everyone else gets one final turn.
- Cards go from **0 to 13** and count their face value. Lowest total score wins.

## Tech Stack

| Layer    | Tech                                      |
| -------- | ----------------------------------------- |
| Client   | React, TypeScript, Vite, Tailwind CSS     |
| Server   | Node.js, Express, Socket.IO               |
| State    | Zustand (client), in-memory (server)      |
| Extras   | Framer Motion, React Three Fiber, Lucide  |
| Deploy   | Vercel (client) · Render (server)         |

## Project Structure

```
├── client/          # React frontend (Vite)
├── server/          # Express + Socket.IO backend
└── shared/          # Shared types, rules & game config
```

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Install & Run

```bash
# Install all dependencies (root + client + server)
npm run install:all

# Start both client & server in dev mode
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:8080`.

## Game Rules

| Card    | Points  | Copies | Action         |
| ------- | ------- | ------ | -------------- |
| 0       | 0       | 2      | —              |
| 1 – 6   | 1 – 6   | 4 each | —              |
| 7, 8    | 7, 8    | 4 each | Peek own card  |
| 9, 10   | 9, 10   | 4 each | Spy opponent   |
| 11, 12  | 11, 12  | 4 each | Blind swap     |
| 13      | 13      | 2      | —              |

- **2–4 players** per room.
- Game ends when a player's total score reaches **100**.
- Failed Cabo call = **+10 penalty**.
- Ending a round with exactly two 12s and two 13s is an instant win: everyone else gets **50 points**.

Card artwork originals live in `art/cards/`; the game uses the WebP versions in `client/src/assets/cards/`.

## License

MIT
