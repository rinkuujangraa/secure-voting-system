# 🗳️ Secure Online Voting System

A full-stack online voting platform with encrypted ballot storage, role-based access control, and full election lifecycle management — built with Next.js 14 and MongoDB.

## Why this project

Traditional demo voting apps only focus on UI. This project focuses on **trust boundaries**:
- Authenticated access with role-aware routing
- AES-256-CBC encrypted vote payloads at rest
- Duplicate-vote protection enforced in DB constraints and backend logic
- Admin workflows for complete election lifecycle management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers, Node.js |
| Database | MongoDB with Mongoose |
| Security | JWT (HTTP-only cookies), bcrypt, AES-256-CBC, Zod validation |
| Deployment | Vercel + MongoDB Atlas |

## Quick Start

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local, Docker, or Atlas)

### Setup

```bash
# Clone and install
git clone https://github.com/rinkuujangraa/secure-voting-system.git
cd secure-voting-system
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Start MongoDB (choose one)
docker run --name voting-mongodb -d -p 27017:27017 mongo:latest
# OR: brew services start mongodb-community
# OR: use MongoDB Atlas connection string

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `ENCRYPTION_KEY` | ✅ | 32-char key for AES-256-CBC vote encryption |
| `ENCRYPTION_IV` | ✅ | 16-char initialization vector |
| `ADMIN_REGISTRATION_SECRET` | ✅ | Invite code for admin registration |
| `NEXTAUTH_URL` | ✅ | Base app URL (`http://localhost:3000`) |
| `NODE_ENV` | ✅ | `development` or `production` |

## Project Structure

```
app/
├── (admin)/admin/       Admin pages (dashboard, elections, candidates, electors, results)
├── (user)/user/         Voter pages (dashboard, elections, vote, results)
├── api/                 13 API endpoints for auth, voting, and admin
├── login/               Login page
├── register/            Registration page
├── layout.tsx           Root layout
├── globals.css          Global styles
├── page.tsx             Landing page
components/              Shared UI components (Navbar, etc.)
lib/                     Database, JWT, encryption, validation helpers
models/                  Mongoose schemas (User, Election, Candidate, Vote)
middleware.ts            Route + role protection
```

## Security Model

1. **Auth** — Password verified against bcrypt hash → JWT stored in HTTP-only cookie
2. **Route protection** — Middleware verifies token + role before granting access
3. **Vote integrity** — Payload encrypted with AES-256-CBC before persistence
4. **Duplicate prevention** — Backend checks + unique DB constraints
5. **Validation** — All request bodies/params validated with Zod

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Sign in |
| `/api/auth/login` | DELETE | Sign out |
| `/api/elections` | GET | List available elections |
| `/api/candidates` | GET | List candidates (query: `electionId`) |
| `/api/vote` | POST | Cast encrypted vote |
| `/api/results` | GET | View results (query: `electionId`) |
| `/api/admin/elections` | GET/POST | List / create elections |
| `/api/admin/elections/[id]` | PUT/DELETE | Update / delete election |
| `/api/admin/candidates` | POST | Add candidate |
| `/api/admin/candidates/[id]` | DELETE | Remove candidate |
| `/api/admin/results` | GET | Election analytics |
| `/api/health` | GET | Health check |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frinkuujangraa%2Fsecure-voting-system)

1. Create a **MongoDB Atlas** cluster and get your connection URI
2. Import this repo into Vercel
3. Add all environment variables in Vercel project settings
4. Deploy — that's it!

## License

MIT
