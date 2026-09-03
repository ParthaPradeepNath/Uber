# Product Requirements Document (PRD)

## Uber Clone — Ride-Hailing Platform

|                     |                                         |
| ------------------- | --------------------------------------- |
| **Document status** | Approved — v1.0                         |
| **Last updated**    | 2026-09-03                              |
| **Author**          | Partha                                  |
| **Project type**    | Full-stack ride-hailing web application |
| **Target**          | Riders and driver-captains              |

---

## 1. Overview

An end-to-end ride-hailing platform inspired by Uber, enabling riders to book
drives and captains to accept and fulfil them with live location tracking —
all on a modern web stack with zero third-party map billing.

### 1.1 Product Vision

> Move people the way a city deserves — connect riders with nearby captains in
> real time, with transparent pricing, live tracking, and a seamless checkout,
> powered entirely by open, free map and routing services.

### 1.2 Problem Statement

Ride-hailing platforms are invaluable but their integrations (maps, payments,
real-time transport) are tightly coupled to paid vendors. This project builds
a complete, functional clone using **free, open-source alternatives** —
OpenStreetMap, Compose transit — so it can run end-to-end without API keys or
recurring costs, making it an ideal reference and learning artifact.

### 1.3 Goals

- **G1 — Complete booking flow:** rider requests → captain accepts → trips.
- **G2 — Real-time experience:** live captain location and ride status via a
  native WebSocket transport.
- **G3 — Transparent pricing:** fare estimation across three vehicle classes.
- **G4 — Zero external map cost:** all mapping, geocoding, and routing free.
- **G5 — Production-ready codebase:** clean commits, modern deps, linted UI.

### 1.4 Non-Goals (v1)

- Real payment gateway integration (payments are simulated/tracked only).
- Native mobile apps (web-first responsive UI).
- Multi-city geo-fencing, surge pricing, carpooling, or scheduling.
- Wallet/balance features, ratings, and in-app chat.

---

## 2. Personas

### 2.1 Rider (User)

- **Needs:** book a ride quickly, know the fare up front, track the captain,
  review past trips.
- **Frustrations:** opaque pricing, no live tracking, clunky checkout.
- **Success:** books a ride in under a minute, watches it arrive, pays and
  sees it in history.

### 2.2 Captain (Driver)

- **Needs:** go online, receive nearby ride offers, accept/reject, start and
  complete trips, confirm rider with an OTP.
- **Frustrations:** irrelevant requests, unclear fare, no control over
  availability.
- **Success:** toggles online, accepts a relevant fare, completes the trip
  and returns to available state.

---

## 3. User Stories & Requirements

### 3.1 Authentication & Roles

| ID  | Story                                                                | Priority |
| --- | -------------------------------------------------------------------- | -------- |
| A1  | As a user, I can register and log in so I can request rides.         | P0       |
| A2  | As a captain, I can register with my vehicle details and log in.     | P0       |
| A3  | As either role, I can log out, invalidating my session token.        | P0       |
| A4  | As an app, I protect dashboards so only the matching role can enter. | P0       |

### 3.2 Booking

| ID  | Story                                                               | Priority |
| --- | ------------------------------------------------------------------- | -------- |
| B1  | As a user, I can search pickup/destination by address.              | P0       |
| B2  | As a user, I can see fare/distance/time for car/auto/moto.          | P0       |
| B3  | As a user, I can request a ride and cancel while pending.           | P0       |
| B4  | As a user, I see live captain location and status after acceptance. | P0       |

### 3.3 Captain Ops

| ID  | Story                                                      | Priority |
| --- | ---------------------------------------------------------- | -------- |
| C1  | As a captain, I can go online/offline to receive requests. | P0       |
| C2  | As a captain, I stream my live location while online.      | P0       |
| C3  | As a captain, I can accept or decline incoming requests.   | P1       |
| C4  | As a captain, I start a trip with the rider's 4-digit OTP. | P0       |
| C5  | As a captain, I complete a trip and return to available.   | P0       |

### 3.4 History & Payments

| ID  | Story                                                              | Priority |
| --- | ------------------------------------------------------------------ | -------- |
| H1  | As a user, I can view my ride history with status and fare.        | P1       |
| H2  | As a user, I see a simulated payment record when a trip completes. | P2       |

---

## 4. Functional / Interaction Specifications

### 4.1 Ride State Machine

```
                       captain accepts
   ┌──────────┐  ─────────────────────▶ ┌────────────┐
   │ pending  │                          │  accepted  │
   └──────────┘                          └─────┬──────┘
        │  user cancels                       │ captain enters OTP
        ▼                                     ▼
   ┌──────────┐                          ┌──────────────┐
   │cancelled │                          │ in-progress  │
   └──────────┘                          └──────┬───────┘
                                                │ captain completes
                                                ▼
                                          ┌──────────────┐
                                          │  completed   │  ▸ payment set
                                          └──────────────┘
```

Legal transitions: `pending → accepted | cancelled`, `accepted → in-progress`,
`in-progress → completed`.

### 4.2 Fare Model

Fare = **base fare** + (**per-km** × distance) + (**per-min** × duration).

| Vehicle       | Base  | Per km | Per min |
| ------------- | ----- | ------ | ------- |
| Car           | $2.00 | $1.50  | $0.25   |
| Auto rickshaw | $1.50 | $1.00  | $0.20   |
| Motorcycle    | $1.00 | $0.75  | $0.15   |

Distance/duration come from the **OSRM** routing service (with a Haversine
fallback); addresses are geocoded by **Nominatim** (OpenStreetMap).

### 4.3 Real-Time Protocol (Native WebSocket)

Transport: bare [`ws`](https://www.npmjs.com/package/ws) server on `/ws`;
browser uses the standard `WebSocket` API — no Socket.io.

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

The client includes automatic reconnect with exponential backoff (max 5).

---

## 5. Functional Requirements (Detailed)

### 5.1 Registration / Login

- Passwords hashed with **bcrypt** (cost factor 10).
- Sessions issued as **JWT** (24h expiry), delivered via cookie and
  `Authorization: Bearer`.
- Logout **blacklists** the token in MongoDB to prevent reuse.
- express-validator enforces field rules (email format, min lengths,
  vehicle enum, numeric capacity).

### 5.2 Ride Creation

- `POST /rides/create` geocodes both addresses, computes distance/duration,
  calculates fare by vehicle type, persists a `Ride`, then broadcasts a
  `ride-request` to all online captains of the matching vehicle type.

### 5.3 Captain Matching

- Captains register a GeoJSON `location` with a `2dsphere` index.
- Nearby captains found via MongoDB `$geoNear` aggregation within 10 km,
  filtered by `status: active` and vehicle type.

### 5.4 Trip Execution

- Captain `confirm` binds the ride; user receives `ride-accepted`.
- Captain enters the rider's **OTP** to transition to `in-progress`.
- Captain `complete` sets `completed` and marks `payment: completed`.

---

## 6. Data Model

### User

```
fullname { firstname, lastname } | email (unique) | password (hidden) | socketId
```

### Captain

```
fullname { firstname, lastname } | email (unique) | password (hidden)
status (active|inactive) | socketId
vehicle { color, plate, capacity, vehicleType (car|motorcycle|auto) }
location (GeoJSON Point, 2dsphere indexed)
```

### Ride

```
user (ref User) | captain (ref Captain)
pickup (Point + pickupAddress) | destination (Point + destinationAddress)
distance | duration | vehicleType | fare | otp (hidden)
status (pending|accepted|in-progress|completed|cancelled)
payment (pending|completed)
acceptedAt | startedAt | completedAt | cancelledAt
```

### Payment

```
ride (ref Ride) | user (ref User) | captain (ref Captain)
amount | method (cash|card|upi) | status (pending|completed|refunded) | paidAt
```

### BlacklistToken

```
token (unique) | createdAt (expires after 86400s = 24h)
```

---

## 7. API Reference

### Users

| Method | Route             | Auth | Description               |
| ------ | ----------------- | ---- | ------------------------- |
| POST   | `/users/register` | —    | Register a rider          |
| POST   | `/users/login`    | —    | Log in a rider            |
| GET    | `/users/profile`  | user | Get rider profile         |
| GET    | `/users/logout`   | user | Log out + blacklist token |

### Captains

| Method | Route                       | Auth    | Description                  |
| ------ | --------------------------- | ------- | ---------------------------- |
| POST   | `/captains/register`        | —       | Register a captain + vehicle |
| POST   | `/captains/login`           | —       | Log in a captain             |
| GET    | `/captains/profile`         | captain | Get captain profile          |
| GET    | `/captains/logout`          | captain | Log out + blacklist token    |
| PATCH  | `/captains/toggle-status`   | captain | Go online/offline            |
| PATCH  | `/captains/update-location` | captain | Stream live location         |

### Rides

| Method | Route             | Auth    | Description                            |
| ------ | ----------------- | ------- | -------------------------------------- |
| GET    | `/rides/fare`     | user    | Estimate fare for pickup → destination |
| POST   | `/rides/create`   | user    | Request a ride                         |
| GET    | `/rides/:rideId`  | user    | Get ride status                        |
| POST   | `/rides/confirm`  | captain | Accept a pending ride                  |
| POST   | `/rides/start`    | captain | Start trip (OTP required)              |
| POST   | `/rides/complete` | captain | Complete trip                          |
| POST   | `/rides/cancel`   | user    | Cancel a pending ride                  |
| GET    | `/rides/history`  | user    | List rider's past trips                |

---

## 8. Acceptance Criteria

1. **Rider books a ride:** from `/user-home`, set pickup + destination, see
   three fares, request, and receive/see the captain accept in real time.
2. **Captain accepts:** online captains receive the request and can accept,
   start (with OTP), and complete the trip.
3. **Live tracking:** the rider sees the captain's moving marker after
   acceptance and until completion.
4. **History:** a completed trip appears in `/ride-history` with fare and
   payment marked completed.
5. **Auth guards:** unauthenticated or cross-role access redirects to login.
6. **Fare correctness:** displayed fare matches `base + km×rate + min×rate`.

---

## 9. Non-Functional Requirements

| Area          | Requirement                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| Performance   | Fare estimation within ~1–2s incl. geocoding + routing.                     |
| Real-time     | Location updates streamed as browser geolocation fires.                     |
| Security      | Passwords bcrypt-hashed; JWT in cookie + Bearer; token blacklist on logout. |
| Reliability   | WebSocket auto-reconnect (up to 5 attempts, exponential backoff).           |
| Accessibility | Semantic inputs with `required` and clear labels.                           |
| Compatibility | Targets latest evergreen browsers; Node.js 20+ for the backend.             |
| Cost          | Zero external map/routing API spend (OpenStreetMap stack).                  |

---

## 10. Out-of-Scope / Future Work

- Real payment providers (Stripe/Razorpay) and wallets.
- Driver and rider ratings/feedback.
- Surge pricing and dynamic fleet dispatch.
- Push notifications and SMS OTP.
- Multi-city / region restrictions and fare cards.
- Admin dashboard and analytics.
- Schedule-ahead and carpooling.

---

## 11. Milestones

| Milestone          | Scope                                                | Status  |
| ------------------ | ---------------------------------------------------- | ------- |
| M1 — Auth          | User/captain registration, login, profile, logout    | ✅ Done |
| M2 — Ride core     | Ride model, fare calc, create/confirm/start/complete | ✅ Done |
| M3 — Real-time     | Native WebSocket, location streaming, ride lifecycle | ✅ Done |
| M4 — UX dashboards | User + captain dashboards with Leaflet map           | ✅ Done |
| M5 — History       | Trip history + simulated payment record              | ✅ Done |
| M6 — Docs & deps   | PRD, README, all dependencies bumped to latest       | ✅ Done |
