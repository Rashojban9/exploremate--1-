# ExploreMate

ExploreMate is a React + TypeScript frontend with a Spring Boot backend for authentication and travel data APIs.

## Tech Stack

- Frontend: React 18, Vite, TypeScript, GSAP
- Backend: Spring Boot 3, Java 21, Maven, Spring Security, JWT, H2

## Prerequisites

- Node.js 18+
- Java 21
- Maven 3.9+

## Run Frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

## Demo Accounts

Seed data is created on first backend start:

- `demo@exploremate.app` / `Password@123`
- `admin@exploremate.app` / `Password@123`

## Auth Integration

Frontend login/signup now calls:

- `POST /api/auth/register`
- `POST /api/auth/login`

A Vite proxy is configured so `/api/*` from frontend goes to `http://localhost:8080` during development.

## Backend API Overview

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/ai/suggestion` (JWT)
- `GET /api/trips` (JWT)
- `POST /api/trips` (JWT)
- `DELETE /api/trips/{tripId}` (JWT)
- `GET /api/saved` (JWT)
- `POST /api/saved` (JWT)
- `DELETE /api/saved/{itemId}` (JWT)

Use `Authorization: Bearer <token>` for protected endpoints.

For server-side AI suggestions, set `GEMINI_API_KEY` in the backend environment.
