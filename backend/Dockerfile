FROM golang:1.26-alpine

WORKDIR /app

RUN go mod tidy

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/main/main.go

EXPOSE 8080

CMD [ "/server" ]