# Stage 1: Build
FROM node:25-alpine AS builder
WORKDIR /app
# Tambahkan 2 baris ini untuk menangkap variabel build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:25-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Menyalin hasil build dari stage builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Jalankan sebagai non-root user untuk keamanan tambahan
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
