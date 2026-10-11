# VideoTube — YouTube Clone (Full Stack)

A full-stack YouTube-style video platform built with **Express + MongoDB** (backend) and **React + Vite** (frontend).
## Features

### Backend
- User auth (register, login, logout, refresh token)
- Video upload & management (Cloudinary)
- Comments & likes
- Subscriptions & channel profiles
- Playlists & watch history
- Creator dashboard stats

### Frontend
- Home feed with search
- Video player with comments & likes
- User registration & login
- Video upload
- Channel pages with subscribe

## Project Structure

```
PROJECT_1/
├── src/                 # Express backend
├── frontend/            # React frontend
├── public/temp/         # Temporary upload folder (multer)
└── .env                 # Backend environment variables
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or Atlas URI
- Cloudinary account (for avatar, cover, video uploads)

## Setup

### 1. Backend

```bash
npm install
cp .env.sample .env
# Edit .env with your MongoDB URI, JWT secrets, and Cloudinary credentials
mkdir -p public/temp
npm run dev
```

Backend runs at `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`

## API Routes

| Route | Description |
|-------|-------------|
| `GET /api/v1/healthcheck` | Health check |
| `/api/v1/users/*` | Auth & user profile |
| `/api/v1/videos/*` | Video CRUD |
| `/api/v1/subscriptions/*` | Subscribe / unsubscribe |
| `/api/v1/comments/*` | Video comments |
| `/api/v1/likes/*` | Like videos & comments |
| `/api/v1/playlist/*` | Playlists |
| `/api/v1/dashboard/*` | Creator stats |

## Database Schema

See the [Eraser diagram](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share) for models.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend with nodemon |
| `cd frontend && npm run dev` | Start frontend dev server |
| `cd frontend && npm run build` | Build frontend for production |
