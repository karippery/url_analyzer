FROM golang:1.22-alpine AS builder

ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o crawler ./cmd

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/crawler .

EXPOSE 8080

CMD ["./crawler"]
