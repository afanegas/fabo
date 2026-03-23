# Cabo

A real-time multiplayer card game built with React and Socket.IO. Play the classic [Cabo card game](https://en.wikipedia.org/wiki/Cabo_(game)) online with friends.

🎮 **Live at** [playcabo.vercel.app](https://playcabo.vercel.app)

## How to Play

- Each player starts with **4 face-down cards** and peeks at 2 of them.
- On your turn, draw from the **deck** or **discard pile**, then swap or discard.
- Special cards (7-Q) grant abilities: **Peek**, **Spy**, **Swap**, **Look & Swap**.
- Call **"Cabo!"** when you think you have the lowest hand — everyone else gets one final turn.
- **Kings = 0 points**. Lowest total score wins.

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

| Card    | Points | Action         |
| ------- | ------ | -------------- |
| K       | 0      | —              |
| A       | 1      | —              |
| 2 – 6   | 2 – 6  | —              |
| 7, 8    | 7, 8   | Peek own card  |
| 9, 10   | 9, 10  | Spy opponent   |
| J       | 10     | Blind swap     |
| Q       | 10     | Look & swap    |

- **2–4 players** per room.
- Game ends when a player's total score reaches **100**.
- Failed Cabo call = **+10 penalty**.

## License

MIT
