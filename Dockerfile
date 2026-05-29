FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup -S toyla && adduser -S toyla -G toyla
COPY --from=builder --chown=toyla:toyla /app/.next/standalone ./
COPY --from=builder --chown=toyla:toyla /app/.next/static ./.next/static
COPY --from=builder --chown=toyla:toyla /app/public ./public
USER toyla
EXPOSE 3000
CMD ["node", "server.js"]
