# url_analyzer# URL Analyzer

A full-stack web app to crawl and analyze URLs, with a Go/Gin backend and React/MUI frontend, containerized with Docker.

## Features
- Submit URLs for crawling.
- View results in a paginated table.
- JWT-based authentication.
- Responsive design.

## Technology Stack
- **Frontend**: React, TypeScript, MUI, Styled-Components, Node.js, npm.
    - See the [frontend documentation](./crawler-frontend/README.md)
- **Backend**: Go 1.22, Gin, JWT, MySQL 8.0, GORM, Docker.
    - See the [backend documentation](./backend/README.md)

## Prerequisites
- Docker (20.10+)
- Docker Compose (1.29+)
- Git

## Setup
1. Clone the repo:
   ```bash
   git clone <repository-url>
   cd url_analyzer
   ```
2. Create `.env` in `root/`:
   ```env
    DATABASE_DSN=user:password@tcp(db:3306)/url_analyzer?charset=utf8mb4&parseTime=True&loc=Local
    SERVER_ADDRESS=:8080
    WORKER_POLL_INTERVAL=5s
   ```
3. Build and run:
   ```bash
   docker-compose up -d --build
   ```

## Usage
- Register: [http://localhost:3000/register](http://localhost:3000/register)
- Log in: [http://localhost:3000/login](http://localhost:3000/login)
- Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard) (after login)

