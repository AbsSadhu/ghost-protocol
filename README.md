# Ghost Protocol Web Frontend

React + Vite frontend for the Ghost Protocol secure messaging client. It provides authentication, chat UI, WebSocket-driven presence/typing updates, and a set of signature visual effects (Target Cursor, Liquid Ether, Matrix Rain, Shiny Text, Variable Proximity).

## Features
- Auth flow with protected routes (login/register/dashboard/chat)
- Socket.IO client for presence, typing, and message delivery states
- API client layer for REST calls to the backend
- Zustand state stores for auth and chat
- TailwindCSS + custom effects (GSAP/three.js) for the UI polish

## Requirements
- Node.js 18+
- npm
- Backend API and Socket.IO server reachable at the URLs configured in `.env`

## Setup
```bash
cd ghost-protocol-web/frontend
npm install
cp .env.example .env   # or copy via Explorer
# edit .env with API and Socket URLs (and Google OAuth client ID if used)
npm run dev            # starts Vite dev server on http://localhost:3000
```

## Environment variables
```
VITE_API_URL=http://localhost:8000      # REST API base URL
VITE_SOCKET_URL=http://localhost:8000   # Socket.IO endpoint
VITE_GOOGLE_CLIENT_ID=...               # Optional: Google OAuth client ID
```

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build to `dist`
- `npm run preview` – preview the production build

## Project structure
```
src/
  components/        # UI building blocks and effects
  context/           # Auth provider
  pages/             # Home, Login, Register, Dashboard, Chat
  services/          # api.js (REST), socket.js (Socket.IO)
  store/             # authStore, chatStore
  utils/             # helpers
```

## What is not here (for now)
- Backend (FastAPI + MongoDB) lives in ../backend and is intentionally excluded from this push. Point the API/socket URLs to your running backend when available.
- Assets/images: `public/` is empty to avoid shipping heavy media; add your own logos/backgrounds if needed.

## Pushing just the frontend
If you want this folder as its own GitHub repo:
```bash
cd ghost-protocol-web/frontend
git init
git add .
git commit -m "feat: add ghost protocol web frontend"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
