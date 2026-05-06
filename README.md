# Ecommerce Architecture

React micro-frontend ecommerce demo with:

- `host-app` in React + Webpack Module Federation
- `remote-app` in React + Webpack Module Federation
- `user-service` in Node.js + Prisma + MySQL
- `product-service` in Node.js + MongoDB
- `gateway` in Nginx
- `redis`, `mysql`, `mongodb` in Docker

## Project Structure

```text
frontend/
  host-app/
  remote-app/
services/
  user-service/
  product-service/
gateway/
docker-compose.yml
```

## Current Architecture

This project is React-only on the frontend.

- `frontend/host-app` is the main app on port `3000`
- `frontend/remote-app` is the federated remote on port `3001`
- `services/user-service` runs on port `4001`
- `services/product-service` runs on port `4002`
- Docker is used for MySQL, MongoDB, and Redis

In the current local development flow, the `gateway` service is ignored.

- frontend talks directly to backend services
- `host-app` is opened directly on `http://localhost:3000`
- `user-service` is called directly on `http://localhost:4001`
- `product-service` is called directly on `http://localhost:4002`

`gateway/nginx.conf` is kept for optional Docker or production-style deployment, not for the normal local dev flow.

### Flow Comparison

Without gateway:

```text
Browser -> host-app:3000
Browser -> user-service:4001
Browser -> product-service:4002
```

With gateway:

```text
Browser -> nginx:80
nginx -> host-app:3000
nginx -> user-service:4001
nginx -> product-service:4002
```

What this means:

- without gateway, the browser talks to multiple ports directly
- with gateway, the browser talks to one public entrypoint and Nginx forwards requests internally
- without gateway, frontend code usually needs direct backend URLs
- with gateway, frontend can use cleaner paths like `/api/users` and `/api/products`

Old Next.js files and routing are no longer part of the active setup.

## Prerequisites

- Node.js `20` recommended
- npm
- Docker Desktop

Node version reference: [.nvmrc](</c:/Users/yadav/OneDrive/Documents/project/ecommerce-architecture/.nvmrc:1>)

## Environment

Root [.env](</c:/Users/yadav/OneDrive/Documents/project/ecommerce-architecture/.env:1>) contains:

- MySQL credentials
- MongoDB database name
- Redis port
- MySQL port
- MongoDB port
- Nginx port

## Recommended Run Mode

Recommended workflow:

- Frontend runs locally
- Backend services run locally
- MySQL, MongoDB, and Redis run in Docker

## Quick Start

Use the PowerShell helpers from the project root:

```powershell
.\scripts\start-local.ps1
```

To stop the local app stack:

```powershell
.\scripts\stop-local.ps1
```

### 1. Start Docker services

From project root:

```bash
docker compose up -d mysql mongodb redis
```

### 2. Install service dependencies

If you have not installed dependencies after pulling the latest changes:

```bash
cd services/user-service
npm install

cd ../product-service
npm install
```

### 3. Start user-service locally

```bash
cd services/user-service
set DATABASE_URL=mysql://user:userpass@localhost:3306/userdb
set REDIS_URL=redis://localhost:6379
set PRODUCT_EVENTS_CHANNEL=product-events
npm run prisma:push
npm run dev
```

Runs at `http://localhost:4001`

Health check:

```bash
http://localhost:4001/health
```

### 4. Start product-service locally

```bash
cd services/product-service
set MONGO_URL=mongodb://localhost:27017/productdb
set REDIS_URL=redis://localhost:6379
set PRODUCT_EVENTS_CHANNEL=product-events
npm run dev
```

Runs at `http://localhost:4002`

Health check:

```bash
http://localhost:4002/health
```

### 5. Start remote-app locally

```bash
cd frontend/remote-app
npm run dev
```

Runs at `http://localhost:3001`

### 6. Start host-app locally

```bash
cd frontend/host-app
npm run dev
```

Runs at `http://localhost:3000`

## URLs

- Host app: `http://localhost:3000`
- Remote app: `http://localhost:3001`
- User API: `http://localhost:4001/api/users`
- User activity API: `http://localhost:4001/api/users/activity`
- Product API: `http://localhost:4002/api/products`
- User health: `http://localhost:4001/health`
- Product health: `http://localhost:4002/health`

## Cross-Service Example

This repo now includes a simple real event-driven microservice flow:

- browser creates a product through `product-service`
- `product-service` publishes a `product.created` event to Redis
- `user-service` subscribes to that Redis channel and consumes the event
- `user-service` stores the latest received product events in memory
- `host-app` reads those events from `http://localhost:4001/api/users/activity`

Flow:

```text
Browser -> product-service:4002/api/products
product-service -> Redis channel:product-events
Redis channel:product-events -> user-service
Browser -> user-service:4001/api/users/activity
```

What you can test:

1. Open `http://localhost:3000`
2. Create a new product from the dashboard
3. Watch the "Cross-service activity" section update

What this demonstrates:

- one microservice can publish an event without knowing another service URL
- a broker can decouple the producer from the consumer
- internal async communication can stay separate from public browser APIs
- the frontend can display the result of backend-to-backend communication in a visible way

## Full Docker Mode

If you want everything in Docker:

```bash
docker compose up --build
```

For active development, local frontend/backend plus Docker infrastructure is the better setup.

## Gateway Status

Current status:

- Local development: `gateway` is not used
- Full Docker mode: `gateway` can be used
- Production-style deployment: `gateway` is optional, but useful

Why it is ignored locally:

- local frontend development is easier on direct ports
- webpack dev servers work better without an extra proxy layer
- debugging API and module federation issues is simpler

Practical benefit when you do use the gateway:

- one public URL for the browser instead of separate frontend and backend ports
- cleaner routing because Nginx decides which service receives each request
- fewer CORS problems because browser traffic can stay on one origin
- backend ports can stay hidden from the browser
- future features like auth checks, rate limiting, logging, caching, and TLS termination can be added at the gateway layer

## If You Want Gateway In Production

If you want to use Nginx gateway in production or production-like Docker deployment, route all browser traffic through the gateway instead of calling service ports directly.

### What to change

1. Make frontend API calls point to the gateway instead of direct backend ports.

Current local URLs:

- `http://localhost:4001/api/users`
- `http://localhost:4002/api/products`

Production-style gateway URLs:

- `/api/users`
- `/api/products`

2. Make sure `host-app` and `remote-app` are reachable through the gateway host.

3. Update Module Federation remote URL if the browser should load the remote through gateway instead of direct port `3001`.

Current host remote config in [frontend/host-app/webpack.config.js](</c:/Users/yadav/OneDrive/Documents/project/ecommerce-architecture/frontend/host-app/webpack.config.js:1>):

```js
remoteApp: "remoteApp@http://localhost:3001/remoteEntry.js"
```

Production-style example:

```js
remoteApp: "remoteApp@http://your-domain/remoteEntry.js"
```

or if you proxy remote assets through a subpath:

```js
remoteApp: "remoteApp@http://your-domain/remote/remoteEntry.js"
```

4. Update [gateway/nginx.conf](</c:/Users/yadav/OneDrive/Documents/project/ecommerce-architecture/gateway/nginx.conf:1>) so it proxies:

- `/` to `host-app`
- `/api/users` to `user-service`
- `/api/products` to `product-service`
- remote federation asset path such as `/remote/` to `remote-app` if needed

### Recommended production gateway shape

Example routing idea:

- `https://your-domain/` -> `host-app`
- `https://your-domain/api/users` -> `user-service`
- `https://your-domain/api/products` -> `product-service`
- `https://your-domain/remote/remoteEntry.js` -> `remote-app`

In this model, the browser only needs to know one base URL. Nginx becomes the traffic router in front of the frontend and APIs, which makes deployment cleaner than exposing `3000`, `3001`, `4001`, and `4002` separately.

### How to use it

For Docker-based production-style run:

```bash
docker compose up --build
```

Then open the gateway URL instead of frontend direct ports:

- `http://localhost:8080` if `NGINX_PORT=8080`

### Practical code changes for gateway mode

For cleaner production support, you should do these code improvements:

1. Move host API URLs to a single config layer instead of hardcoded localhost fallbacks.
2. Add separate local and production values for:
   - user API base URL
   - product API base URL
   - remote federation URL
3. If gateway serves remote assets under a path like `/remote/`, update both:
   - Nginx routing
   - `ModuleFederationPlugin` remote URL in `host-app`

### Suggested target behavior

- Local mode:
  - host -> `http://localhost:3000`
  - remote -> `http://localhost:3001`
  - APIs -> direct `4001` and `4002`
- Production mode:
  - browser opens only gateway URL
  - gateway forwards API requests
  - gateway also serves host and remote frontend assets

If you want, this repo can be refactored further so gateway mode becomes first-class instead of optional.

## Notes

- `host-app` consumes `remote-app/ProductCatalog` using Module Federation
- Browser-side `process.env` dependency has been removed from the React runtime path
- If `localhost:3000` shows stale errors, do a hard refresh

## Troubleshooting

- If `localhost:3000` is blank, do a hard refresh with `Ctrl + Shift + R`
- If `3000` or `3001` is already in use, stop old processes before restarting
- If Prisma fails to connect, make sure MySQL is running on `localhost:3306`
- If product data does not load, make sure MongoDB is running on `localhost:27017`
- If the remote widget does not appear, verify `http://localhost:3001/remoteEntry.js` is reachable
- If Docker containers are already using `3000` or `3001`, stop `host-app`, `remote-app`, and `gateway` containers before running locally

## Useful Commands

```powershell
docker compose ps
docker compose up -d mysql mongodb redis
docker compose stop mysql mongodb redis
Invoke-WebRequest http://localhost:4001/health
Invoke-WebRequest http://localhost:4002/health
```

## Logs

Local run logs are stored in:

- [user-service.log](</c:/Users/yadav/OneDrive/Documents/project/ecommerce-architecture/.run-logs/user-service.log>)
- [product-service.log](</c:/Users/yadav/OneDrive/Documents/project/ecommerce-architecture/.run-logs/product-service.log>)
- [remote-app.log](</c:/Users/yadav/OneDrive/Documents/project/ecommerce-architecture/.run-logs/remote-app.log>)
- [host-app.log](</c:/Users/yadav/OneDrive/Documents/project/ecommerce-architecture/.run-logs/host-app.log>)
