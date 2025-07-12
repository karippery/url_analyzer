# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install git and ca-certificates (needed for HTTPS requests)
RUN apk add --no-cache git ca-certificates

# Copy module files first to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Copy the rest of the application
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o url-analyzer ./cmd

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/url-analyzer .
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Expose port and set entrypoint
EXPOSE 8080
ENTRYPOINT ["./url-analyzer"]