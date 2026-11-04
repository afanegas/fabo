# Cabo: ein Container, der Server (Express + Socket.IO) liefert auch den gebauten Client aus.

FROM node:22-alpine AS build
WORKDIR /app

COPY server/package*.json server/
COPY client/package*.json client/
RUN cd server && npm ci && cd ../client && npm ci

COPY shared shared
COPY server server
COPY client client
RUN cd server && npm run build && cd ../client && npm run build


FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    STATIC_DIR=/app/client/dist \
    DATA_DIR=/data

COPY server/package*.json server/
RUN cd server && npm ci --omit=dev && npm cache clean --force \
 && mkdir -p /data && chown node:node /data

COPY --from=build /app/server/dist server/dist
COPY --from=build /app/client/dist client/dist

USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["node", "server/dist/server/index.js"]
