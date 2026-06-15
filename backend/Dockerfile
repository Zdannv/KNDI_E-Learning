# Stage 1: Build
FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/main/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /server /server

RUN mkdir -p /app/storage/materials \
    && mkdir -p /app/storage/questions/audio \
    && mkdir -p /app/storage/questions/images \
    && addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app/storage \
    && chmod -R 755 /app/storage

USER appuser

EXPOSE 8080
CMD [ "/server" ]