# syntax=docker/dockerfile:1
# Server mode: Node + PostgreSQL. Run with:  docker build -t jeet-telecom . && docker run -p 3000:3000 --env-file .env jeet-telecom

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Optional: bake the Google Sheet catalogue into the first render.
ARG GOOGLE_SHEET_ID=""
ENV GOOGLE_SHEET_ID=$GOOGLE_SHEET_ID
RUN npx next build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Migration + seed folder, applied automatically when the server starts.
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
