FROM node:22-alpine AS base

RUN apk add --update ffmpeg

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app
USER app


FROM base AS builder
WORKDIR /build

# install all packages
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --no-fund

COPY src/ ./src/
RUN npm run build



FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV SERVICE_PORT=3000
ENV FFMPEG_BIN=/usr/bin/ffmpeg

# install only "prod" packages
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --no-fund --omit=dev

COPY public/ ./public/
COPY --from=builder /build/dist/ ./dist/

CMD ["node", "/app/dist/app.js"]
