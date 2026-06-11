# Stage 1: Build
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/main/main.go

# Stage 2: Production image
FROM alpine:latest
WORKDIR /app
# Copy binary dari builder
COPY --from=builder /server /server

# Jalankan sebagai non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD [ "/server" ]
