<div align="center">

# 🚗 Uber Clone

### A full-stack ride-hailing platform with live tracking — powered by free, open-source maps

Riders book. Captains drive. Everyone moves in real time — with **zero map
billing** and a **native WebSocket** pipeline.

</div>

<div align="center">

![Node](https://img.shields.io/badge/node-20%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/mongodb-9-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/tailwindcss-4-06B6D4?logo=tailwindcss&logoColor=white)
![WebSocket](https://img.shields.io/badge/realtime-websocket-4FC08D)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)

</div>

---

## ✨ What is this?

An end-to-end, Uber-inspired ride-hailing application:

- 🧑‍🤝‍🧑 **Riders** search a destination, see live fares for **car / auto /
  motorcycle**, request a ride, and watch their **captain arrive on a live map**.
- 🧑‍✈️ **Captains** go online, receive nearby ride offers, accept with one tap,
  verify the rider with a **4-digit OTP**, complete the trip, and get paid
  (simulated).
- ⚡ Everything updates in real time over a **bare WebSocket** — no Socket.io,
  no paid map SDKs, no API keys.

The entire mapping stack runs on the **OpenStreetMap ecosystem**:

| Need | Service | Cost |
|------|---------|------|
| Interactive map | **Leaflet** + OSM tiles | Free |
| Address search (geocoding) | **Nominatim** (OSM) | Free |
| Distance / duration routing | **OSRM** public server | Free |
| Real-time transport | Native `WebSocket` (`ws`) | Free |

---

## 🧱 Tech Stack

### Backend — `Backend/`
| Layer | Tool |
|-------|------|
| Runtime | Node.js (20+) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Auth | JWT (cookie + Bearer) · bcrypt hashing · token blacklist |
| Realtime | `ws` bare WebSocket server on `/ws` |
| Maps | Nominatim geocoding · OSRM routing |

### Frontend — `Frontend/`
| Layer | Tool |
|-------|------|
| UI | React 19 + Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Maps | Leaflet + react-leaflet |
| Data | Axios API layer · custom event-bus socket client |

---

## 🚀 Getting Started

> **Prereqs:** Node.js 20+, [pnpm](https://pnpm.io/) 9+, a MongoDB database
> (local or [MongoDB Atlas](https://www.mongodb.com/atlas)).

### 1. Clone & install

```bash
git clone <your-repo-url> uber-clone
cd uber-clone

# Install backend + frontend together (single pnpm workspace)
pnpm install
```

> The repo is a **pnpm workspace** (`pnpm-workspace.yaml`) covering `Backend/`
> and `Frontend/`, so one command installs both. `bcrypt`'s native build is
> pre-approved in the workspace config.

### 2. Configure the backend

```bash
cd Backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
DB_CONNECT=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=Uber
JWT_SECRET=your_long_random_secret
```

> `DB_CONNECT` can be a local URI such as `mongodb://127.0.0.1:27017/uberclone`.

### 3. Run both servers

```bash
# Terminal 1 — backend (http://localhost:3000, ws://localhost:3000/ws)
pnpm --filter uber-clone-backend dev

# Terminal 2 — frontend (http://localhost:5173)
pnpm --filter uber-clone-frontend dev
```

> Tip: from inside a workspace directory you can just run `pnpm dev`, e.g.
> `cd Backend && pnpm dev`.

The Vite dev server proxies `/users`, `/captains`, `/rides`, and `/ws` to the
backend automatically, so no extra CORS setup is needed.

### 4. Try the flow

1. Open **http://localhost:5173** and **Create Account** as a rider.
2. In a second browser/incognito window, **Register as a Captain** (add
   vehicle details) and **Go Online**.
3. Back in the rider window, set a pickup + destination, pick a vehicle, and
   **Request a Ride**.
4. Watch the captain's card appear, **Accept**, **enter the OTP** (shown to
   the rider), **Start**, then **Complete** the trip.
5. Check **Trips** on the rider dashboard to see history and the payment
   record.

---

## 🧩 Scripts

> All commands use `pnpm`. From the repo root, target a workspace with
> `pnpm --filter <name> <script>`; or `cd` into a workspace dir and run the
> script directly.

### Backend (`uber-clone-backend`)
```bash
pnpm --filter uber-clone-backend dev    # nodemon development server
pnpm --filter uber-clone-backend start  # production server
```

### Frontend (`uber-clone-frontend`)
```bash
pnpm --filter uber-clone-frontend dev      # Vite dev server
pnpm --filter uber-clone-frontend build    # production build
pnpm --filter uber-clone-frontend lint     # ESLint
pnpm --filter uber-clone-frontend preview  # preview the production build
```

---

## 🗂️ Project Structure

```
uber-clone/
├── Backend/
│   ├── app.js                # Express app + route mounting
│   ├── server.js             # HTTP + WebSocket bootstrap
│   ├── controllers/          # Request handlers (user, captain, ride)
│   ├── routes/               # Routers + express-validator
│   ├── services/             # Business logic (maps, ride, socket)
│   ├── models/               # Mongoose schemas
│   ├── middlewares/          # JWT auth guards
│   └── db/                   # MongoDB connection
├── Frontend/
│   ├── src/
│   │   ├── pages/            # Home, auth, dashboards, history
│   │   ├── components/       # MapView, LocationSearch, ProtectedRoute
│   │   ├── context/          # AuthProvider
│   │   ├── services/         # auth, ride, maps API modules
│   │   └── utils/            # axios instance, WebSocket client
│   ├── vite.config.js        # dev proxy to backend
│   └── package.json
├── pnpm-workspace.yaml       # pnpm workspace (Backend + Frontend)
├── .npmrc                    # pnpm settings
├── PRD.md                    # Full product requirements doc
└── README.md
```

---

## 🗺️ How Real-Time Works

```
 Rider app                Backend (ws /ws)              Captain app
   │                             │                            │
   │  register(user)  ────────▶  │ ◀────────────────  register(captain, userId)
   │  request ride ── POST ───▶ REST                          │
   │                             │  ── ride-request ─────────▶ │
   │  ◀─── ride-accepted ────────│ ◀── accept-ride ─────────── │
   │  follow-captain ───────────▶│                            │
   │  ◀── captain-location ──────│ ◀── update-location ─────── │
   │  ◀── ride-completed ────────│ ◀── complete (OTP) ──────── │
```

- Captains stream browser **geolocation** each tick.
- Users **follow** their assigned captain and receive only that captain's
  location.
- The client **auto-reconnects** with exponential backoff.

---

## 🎯 Feature Checklist

| Feature | Rider | Captain |
|---------|:-----:|:-------:|
| Register / Login / Logout | ✅ | ✅ |
| Vehicle registration | — | ✅ |
| Go online / offline | — | ✅ |
| Live location streaming | — | ✅ |
| Address search / geocoding | ✅ | — |
| Fare estimation (3 classes) | ✅ | ✅ (see request) |
| Request / cancel ride | ✅ | — |
| Receive / accept / decline ride | — | ✅ |
| Live captain tracking | ✅ | — |
| OTP-verified trip start | — | ✅ |
| Trip history | ✅ | — |
| Payment status record | ✅ | ✅ |

---

## 🧪 Acknowledgments

- [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/),
  [Nominatim](https://nominatim.org/), [OSRM](http://project-osrm.org/),
  [Express](https://expressjs.com/), [Mongoose](https://mongoosejs.com/),
  [React](https://react.dev/) & [Vite](https://vitejs.dev/),
  [Tailwind CSS](https://tailwindcss.com/), [`ws`](https://github.com/websockets/ws).

<hr />

<div align="center">
Built with ❤️ as a reference-grade ride-hailing platform.
See <a href="./PRD.md"><code>PRD.md</code></a> for the full product spec.
</div>
