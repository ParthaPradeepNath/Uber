# Uber Clone — Backend API

REST API + native WebSocket layer for the Uber clone ride-hailing platform.

## Stack

- **Node.js + Express** (v5)
- **MongoDB + Mongoose** (v9)
- **bcrypt** password hashing · **JWT** sessions
- **ws** — bare WebSocket server for real-time rides
- **OpenStreetMap** — Nominatim geocoding + OSRM routing (map-free)

## Getting Started

> This repo is a single **pnpm workspace**. From the root, one command
> installs both `Backend/` and `Frontend/`:

```bash
# From the repo root
pnpm install

# Then from anywhere, run only this workspace
pnpm --filter uber-clone-backend dev   # nodemon development
pnpm --filter uber-clone-backend start # production
```

Or from inside this directory simply:

```bash
cd Backend
cp .env.example .env   # set DB_CONNECT and JWT_SECRET
pnpm dev               # or: pnpm start
```

Server listens on `PORT` (default `3000`). WebSocket endpoint: `/ws`.

## Environment Variables

| Variable     | Description                       |
| ------------ | --------------------------------- |
| `PORT`       | HTTP server port (default `3000`) |
| `DB_CONNECT` | MongoDB connection string         |
| `JWT_SECRET` | Secret for signing/verifying JWTs |

## REST Endpoints

### Users

| Method | Route             | Auth | Description               |
| ------ | ----------------- | ---- | ------------------------- |
| POST   | `/users/register` | —    | Register a rider          |
| POST   | `/users/login`    | —    | Log in a rider            |
| GET    | `/users/profile`  | user | Get rider profile         |
| GET    | `/users/logout`   | user | Log out + blacklist token |

### Captains

| Method | Route                       | Auth    | Description                |
| ------ | --------------------------- | ------- | -------------------------- |
| POST   | `/captains/register`        | —       | Register captain + vehicle |
| POST   | `/captains/login`           | —       | Log in a captain           |
| GET    | `/captains/profile`         | captain | Get captain profile        |
| GET    | `/captains/logout`          | captain | Log out + blacklist token  |
| PATCH  | `/captains/toggle-status`   | captain | Go online/offline          |
| PATCH  | `/captains/update-location` | captain | Stream live location       |

### Rides

| Method | Route             | Auth    | Description               |
| ------ | ----------------- | ------- | ------------------------- |
| GET    | `/rides/fare`     | user    | Estimate fare             |
| POST   | `/rides/create`   | user    | Request a ride            |
| GET    | `/rides/:rideId`  | user    | Get ride status           |
| POST   | `/rides/confirm`  | captain | Accept a pending ride     |
| POST   | `/rides/start`    | captain | Start trip (OTP required) |
| POST   | `/rides/complete` | captain | Complete trip             |
| POST   | `/rides/cancel`   | user    | Cancel a pending ride     |
| GET    | `/rides/history`  | user    | List rider's trips        |

Auth is provided via an `Authorization: Bearer <jwt>` header or a `token`
cookie on protected routes.

## WebSocket Protocol (`/ws`)

**Client → Server**

```jsonc
{ "type": "register", "role": "captain|user", "userId": "..." }
{ "type": "update-location", "latitude": 12.9, "longitude": 77.5 }
{ "type": "follow-captain", "captainId": "..." }
{ "type": "accept-ride", "rideId": "..." }
{ "type": "reject-ride", "rideId": "..." }
{ "type": "ping" }
```

**Server → Client**

```jsonc
{ "type": "ride-request", "ride": { "...": "..." } }
{ "type": "ride-accepted", "ride": { "...": "..." } }
{ "type": "ride-started", "ride": { "...": "..." } }
{ "type": "ride-completed", "ride": { "...": "..." } }
{ "type": "captain-location", "captainId": "...", "latitude": ..., "longitude": ... }
```

## Project Structure

```
Backend/
├── app.js                  # Express app, middleware, route mounting
├── server.js               # HTTP + WebSocket bootstrap
├── controllers/            # Request handlers
├── routes/                 # Express routers with validator middleware
├── services/               # Business logic (maps, ride, socket)
├── models/                 # Mongoose schemas
├── middlewares/            # JWT auth guards
└── db/                     # MongoDB connection
```

See the root [`PRD.md`](../PRD.md) and [`README.md`](../README.md) for the full
product spec and setup guide.
