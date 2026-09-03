# Uber Clone — Frontend

React 19 + Vite 8 rider & captain dashboards with live Leaflet maps.

## Stack

- React 19, Vite 8, Tailwind CSS 4, React Router 7
- Leaflet + react-leaflet for maps
- Axios API layer, custom native WebSocket client

## Getting Started

This repo is a single **pnpm workspace** — install everything from the root
(`pnpm install`), then target this package by name:

```bash
pnpm --filter uber-clone-frontend dev    # http://localhost:5173
pnpm --filter uber-clone-frontend build  # production build
pnpm --filter uber-clone-frontend lint   # ESLint
```

> From inside this directory, just run `pnpm dev`.

The Vite dev server proxies `/users`, `/captains`, `/rides`, and `/ws` to the
backend on `http://localhost:3000` (see `vite.config.js`).

## Environment

| Variable       | Default                 | Purpose                        |
| -------------- | ----------------------- | ------------------------------ |
| `VITE_API_URL` | (same-origin via proxy) | Override backend REST base URL |
| `VITE_WS_URL`  | (same-origin `/ws`)     | Override WebSocket URL         |

## Scripts

```bash
pnpm dev       # dev server
pnpm build     # production build
pnpm lint      # ESLint
pnpm preview   # preview production build
```

See the root [`README.md`](../README.md) for the full setup guide and
[`PRD.md`](../PRD.md) for the product spec.
