# URL Analyzer - Backend Service

A secure, high-performance web crawler and analysis API with JWT authentication.

## Features

- **User Authentication**:
  - Registration and login
  - JWT access/refresh tokens
  - Protected API endpoints
- **URL Analysis**:
  - HTML version detection
  - Title extraction
  - Heading structure (H1-H6 counts)
  - Link analysis (internal/external/broken)
  - Login form detection
- **Background Processing**: Worker service for async crawling
- **RESTful API**: JSON responses with pagination

## Technology Stack

- **Language**: Go 1.22
- **Web Framework**: Gin
- **Authentication**: JWT
- **Database**: MySQL 8.0
- **ORM**: GORM
- **Containerization**: Docker
- **Concurrency**: Goroutines

## API Documentation

### Base URL
`http://localhost:8080/api`

---

## Authentication Endpoints

### 1. Register User
```
POST /register
```

**Request:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Successful Response (201):**
```json
{
  "message": "user created"
}
```

---

### 2. Login
```
POST /login
```

**Request:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Successful Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Token Lifetimes**:
- Access Token: 15 minutes
- Refresh Token: 7 days

---

### 3. Refresh Tokens
```
POST /refresh
```

**Request:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Successful Response (200):**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token"
}
```

---

## Protected Endpoints

*All endpoints below require Authorization header:*
```http
Authorization: Bearer your_access_token
```

### 1. Submit URL for Analysis
```
POST /crawl
```

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Successful Response (201):**
```json
{
  "id": 1,
  "url": "https://example.com",
  "status": "queued",
  "created_at": "2025-07-12T08:00:00Z"
}
```

---

### 2. Get Analysis Results
```
GET /results
```

**Query Parameters**:
- `page` (default: 1)
- `pageSize` (default: 10, max: 100)

**Successful Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "url": "https://example.com",
      "html_version": "HTML5",
      "title": "Example Domain",
      "h1_count": 1,
      "internal_links": 3,
      "external_links": 2,
      "has_login_form": false,
      "processing_time": 1.23
    }
  ],
  "page": 1,
  "size": 10
}
```

---

## Development Setup

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+



## Project Structure
```
backend/
├── auth/               # Authentication services
├── handlers/           # API endpoints
├── models/             # Database models
├── repository/         # Data access layer
├── worker/             # Background processing
├── cmd/
│   └── main.go         # Application entrypoint
├── go.mod
└── Dockerfile
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.
```

