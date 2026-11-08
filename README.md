# Cabo

A real-time multiplayer card game built with React and Socket.IO. Play the classic [Cabo card game](https://en.wikipedia.org/wiki/Cabo_(game)) online with friends.

This is a fork of [dcs-soni/cabo](https://github.com/dcs-soni/cabo) with its own illustrated 0–13 deck,
a championship mode and a Docker setup behind Traefik.

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
| Deploy   | Docker, behind Traefik with BasicAuth     |

## Project Structure

```
├── art/cards/       # Original card artwork (not shipped)
├── client/          # React frontend (Vite)
├── server/          # Express + Socket.IO backend
├── shared/          # Shared types, rules & game config
├── Dockerfile       # One image: server also serves the built client
├── docker-compose.yml      # Production, behind Traefik
└── docker-compose.dev.yml  # Local test on this machine, no Traefik
```

## Run with Docker

The image builds client and server and runs both in one container on port 8080.
Running games live in memory only; the championship standings are stored in
`championship.json` in the mounted data folder.

### Local test (Windows, macOS or Linux)

Requires Docker Desktop (or Docker Engine with the compose plugin).

```bash
git clone https://github.com/afanegas/fabo.git
cd fabo
docker compose -f docker-compose.dev.yml up --build -d
```

Open http://localhost:8080. The port is bound to `127.0.0.1` only, and test data
goes to `./data-dev`, so it never mixes with real championship data.

Stop it with:

```bash
docker compose -f docker-compose.dev.yml down
```

### Server installation (Ubuntu, behind Traefik)

Prerequisites:

- Docker Engine with the compose plugin
- A running Traefik 3 with the external network `traefik_proxy`, an entrypoint
  `websecure` and a certificate resolver `le`
- A DNS record for your domain pointing to the server

```bash
git clone https://github.com/afanegas/fabo.git
cd fabo

# Settings: domain and BasicAuth user (see comments in the file)
cp .env.example .env
nano .env

# Data folder for the championship, owned by the container user (uid 1000)
mkdir -p data && sudo chown 1000:1000 data

docker compose up -d --build
```

Create the BasicAuth hash for `.env` with:

```bash
docker run --rm httpd:2.4-alpine htpasswd -nbB yourname 'YourPassword'
```

Put the whole output in single quotes, e.g. `CABO_BASIC_AUTH='yourname:$2y$05$...'`.

The container publishes no port itself; it is only reachable through Traefik and
its password prompt.

### Update

On the server, in the `fabo` folder:

```bash
git pull
docker compose up -d --build
docker image prune -f
```

`git pull` fetches the new code, `up -d --build` rebuilds the image and replaces
the running container, `image prune` removes the old image. The championship data
in `./data` and the `.env` are kept. Games running during the update are lost, so
update between games.

Check that it is running:

```bash
docker compose ps
docker compose logs --tail 50 cabo
```

For the local test setup, use the same commands with `-f docker-compose.dev.yml`.

### Troubleshooting

`EACCES: permission denied, open '/data/championship.json.tmp'` in the logs, with
the container restarting over and over: the container runs as user 1000 and may not
write to `./data`. This happens when the folder was created by Docker (as root)
instead of with the `mkdir` step above. Fix it once:

```bash
sudo chown -R 1000:1000 data
docker compose restart cabo
```

### Backup

The championship standings are a single file. Copy the folder to keep a backup:

```bash
cp -r data data-backup-$(date +%F)
```

## Development without Docker

Requires Node.js ≥ 18.

```bash
# Install all dependencies (root + client + server)
npm run install:all

# Start both client & server in dev mode
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

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
- At the start of a game, **rock-paper-scissors** decides who starts; after that the start moves on to the next player each round.
- In the **Fane-Lebo championship**, every round is a game of its own and counts for the championship.
- Game ends when a player's total score reaches **100**.
- Failed Cabo call = **+10 penalty**.
- Ending a round with exactly two 12s and two 13s is an instant win: everyone else gets **50 points**.

## Card Artwork

Originals live in `art/cards/` (`0`–`13` and `back`). The game uses 400×600 WebP
versions in `client/src/assets/cards/` with the same names. When you replace an
image, convert it to WebP under the same name and rebuild the container.

## License

MIT
