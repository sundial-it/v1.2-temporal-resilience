# Sundial Server

This document explains how to configure and run the Sundial Express server, connect it to MongoDB (Atlas or local), provide an OpenAI API key for the Oracle, and deploy using Docker/Render.

## Prerequisites
- Node.js 18+ (for local dev)
- Docker & Docker Compose (optional, recommended for local dev)
- A MongoDB instance (local or Atlas)
- (Optional) OpenAI API key for production Oracle functionality

## Local Development (Node)

1. Copy environment variables:

   ```bash
   cd server
   cp .env.example .env
   # edit .env and set MONGO_URI and OPENAI_API_KEY if available
   ```

2. Install dependencies and start in dev mode:

   ```bash
   npm install
   npm run dev
   ```

3. The server serves the static client from `client/public` when present and exposes API endpoints:

- `POST /api/waitlist` — save waitlist entries (email, concern)
- `POST /api/oracle` — proxy to OpenAI if `OPENAI_API_KEY` is set, otherwise returns a stub response

## Running with Docker Compose (local Mongo)

From the repository root run:

```bash
docker-compose up --build
# server will be available at http://localhost:3001
```

This starts a local `mongo` service and the `app` container configured to use `mongodb://mongo:27017/sundial`.

## Using MongoDB Atlas

1. Create a free MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist your IP (or 0.0.0.0/0 for quick testing).
3. Copy the connection string and set it as `MONGO_URI` in `server/.env` or in your hosting provider's environment variables. Example:

```
MONGO_URI=mongodb+srv://user:password@cluster0.abcd.mongodb.net/sundial?retryWrites=true&w=majority
```

## OpenAI / Oracle

Set `OPENAI_API_KEY` in `server/.env` (or in your host's env). The server will call OpenAI's chat completions and return the assistant text. If `OPENAI_API_KEY` is missing, the `/api/oracle` endpoint returns a safe stub for testing.

## Deploying to Render (example)

Render can build this repository using the root `Dockerfile` included.

1. Create a new Web Service on Render and connect your GitHub repository.
2. Choose Docker as the environment and add the following environment variables in the Render dashboard:

- `MONGO_URI` — your Atlas connection string
- `OPENAI_API_KEY` — your OpenAI API key
- `PORT` — (optional) default 3001

3. Deploy — Render will build the Docker image and run the service.

## CI / CD

This repo contains a sample GitHub Actions workflow to install dependencies and optionally build/push a Docker image to Docker Hub if `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are configured.

## Notes
- Do not commit secrets to the repository. Use environment variables on your host provider.
- For static-only hosting (Netlify), consider moving the API routes into Netlify Functions or another serverless provider.
Sundial Server
================

This folder contains a minimal Express server to support the static client. It provides:

- `POST /api/waitlist` — save waitlist email to MongoDB
- `POST /api/oracle` — stubbed oracle proxy (replace with real LLM integration)

Setup
------

1. Copy `.env.example` to `.env` and update `MONGO_URI` and keys.
2. Install dependencies:

```bash
cd server
npm install
```

3. Run in development:

```bash
npm run dev
```

The server will serve the `client/public` folder automatically if present.
