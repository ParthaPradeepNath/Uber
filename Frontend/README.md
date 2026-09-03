# Uber Clone — Frontend

React 19 + Vite 8 rider & captain dashboards with live Leaflet maps.

## Stack
- React 19, Vite 8, Tailwind CSS 4, React Router 7
- Leaflet + react-leaflet for maps
- Axios API layer, custom native WebSocket client

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
```

The Vite dev server proxies `/users`, `/captains`, `/rides`, and `/ws` to the
backend on `http://localhost:3000` (see `vite.config.js`).

## Environment
| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | (same-origin via proxy) | Override backend REST base URL |
| `VITE_WS_URL` | (same-origin `/ws`) | Override WebSocket URL |

## Scripts
```bash
npm run dev       # dev server
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview production build
```

See the root [`README.md`](../README.md) for the full setup guide and
[`PRD.md`](../PRD.md) for the product spec.
