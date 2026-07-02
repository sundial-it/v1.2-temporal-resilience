# Sundial — Feature Catalogue & Decisions

This file lists recommended features for the Sundial platform and records decisions needed to finish the project.

Core features (recommended):

- Waitlist / Contact capture (implemented)
  - Email, organization, short concern/notes
- Server-proxied Oracle (implemented, OpenAI integration optional)
  - Server-side API key usage, rate limiting, input sanitization
- Client static pages (implemented)
  - `client/public` is canonical

Backend & Ops (recommended next steps):

- MongoDB Atlas integration (production DB)
  - Create Atlas cluster, set `MONGO_URI` in server environment
- Email notifications / transactional emails
  - Sendgrid / Postmark integration for waitlist confirmations
- Admin view for waitlist entries
  - Basic auth or token-protected endpoint to list recent signups
- Logging & monitoring
  - Sentry, LogDNA, or built-in request logging; rotate logs
- Rate limiting & abuse protection for `/api/oracle`
  - Simple token bucket per-IP or auth key-based restrictions

Security & Compliance:

- Never expose LLM keys client-side — server proxy only (done)
- Add CSP, HSTS, and other security headers in production
- Enforce TLS in front of the server (Load balancer / Render / Cloud)

Deployment options (we scaffolded multiple):

- Docker + Docker Compose (local dev): `docker-compose.yml` included
- Dockerfile present for container-based hosts (Render, Cloud Run)
- Static-only alternative: host `client/public` on Netlify/Vercel and convert `/api` to serverless functions

Questions for you (pick choices or reply inline):

1. Do you want transactional email confirmations for waitlist signups? (yes/no)
2. Which LLM provider do you prefer for the Oracle? (OpenAI / Google Gemini / other)
3. Preferred hosting: Render (Docker), Netlify (static + serverless), or self-hosted? (pick one)
4. Do you want an admin UI to view waitlist entries now? (yes/no)

Add comments below or edit this file with your choices.
