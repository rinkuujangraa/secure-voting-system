# Secure Online Voting System

A secure, full-stack online voting platform built with Next.js 14 and MongoDB.  
It provides separated admin and voter experiences, encrypted ballot storage, and role-based API protection designed for real-world election workflows.

## Why this project

Traditional demo voting apps often focus only on UI. This project focuses on trust boundaries:
- authenticated access with role-aware routing
- encrypted vote payloads at rest
- duplicate-vote protection enforced in backend logic and database constraints
- admin workflows for full election lifecycle management

## Core capabilities

### Security-first architecture
- JWT authentication via HTTP-only cookies
- AES-256-CBC encryption for vote payloads before persistence
- bcrypt password hashing
- Zod validation on request bodies and query params
- middleware-based route protection for both pages and APIs

### Voter experience
- clean dashboard for active/upcoming elections
- election details and candidate listing
- one-click encrypted vote submission with confirmation
- result viewing for published elections

### Admin experience
- create, start, stop, and manage elections
- add/remove candidates
- monitor turnout and live result trends
- track election status from one dashboard

## Tech stack

- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- Backend: Next.js Route Handlers / API routes, Node.js runtime
- Database: MongoDB with Mongoose
- Security: JWT, bcrypt, AES-256-CBC
- Validation: Zod

## Quick start

### 1) Clone and install

```bash
git clone <your-repository-url>
cd VIPIN
npm install
```

### 2) Configure environment

Create `.env.local` from `.env.example` and set values:

```env
MONGODB_URI=mongodb://localhost:27017/voting-system
JWT_SECRET=replace-with-a-strong-secret-min-32-chars
ENCRYPTION_KEY=must-be-exactly-32-characters
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3) Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret for auth |
| `ENCRYPTION_KEY` | Yes | 32-character key for AES-256-CBC vote encryption |
| `NEXTAUTH_URL` | Yes | Base app URL |
| `NODE_ENV` | Yes | Runtime mode (`development` or `production`) |

## Project structure

```txt
app/
  (admin)/admin/        Admin pages
  (user)/user/          Voter pages
  api/                  Authentication, voting, admin endpoints
  login/                Login page
  register/             Registration page
components/             Shared UI components
lib/                    DB, JWT, encryption, validation helpers
models/                 Mongoose models (User, Election, Candidate, Vote)
middleware.ts           Route and role protection
```

## Security model

### Authentication and authorization
1. User registers or logs in with email/password.
2. Password is verified against bcrypt hash.
3. Server issues JWT and stores it in an HTTP-only cookie.
4. Middleware verifies token and role before protected access.

### Vote integrity and confidentiality
1. Voter selects a candidate.
2. Vote data is encrypted server-side.
3. Encrypted payload is stored in `Vote` collection.
4. Duplicate voting is blocked via backend checks and unique constraints.

## API overview

### Auth
- `POST /api/auth/register` - register account
- `POST /api/auth/login` - sign in
- `DELETE /api/auth/login` - sign out

### Voter
- `GET /api/elections` - list available elections
- `GET /api/candidates?electionId=...` - list candidates
- `POST /api/vote` - cast encrypted vote
- `GET /api/results?electionId=...` - view results

### Admin
- `POST /api/admin/elections` - create election
- `GET /api/admin/elections` - list/manage elections
- `PUT /api/admin/elections/[id]` - update election
- `DELETE /api/admin/elections/[id]` - delete election
- `POST /api/admin/candidates` - add candidate
- `DELETE /api/admin/candidates/[id]` - remove candidate
- `GET /api/admin/results?electionId=...` - election analytics

## Deployment

### Vercel + MongoDB Atlas
1. Create a MongoDB Atlas cluster and get the connection URI.
2. Import project into Vercel.
3. Add required environment variables in Vercel settings.
4. Deploy and verify authentication + voting flow in production.

## Testing checklist

- registration/login/logout works
- role-based route protection works
- admin can create/start/stop elections
- voter can vote only once per election
- encrypted votes are stored correctly
- results are accurate after voting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit with clear messages
4. Open a pull request with test notes

## Acknowledgments

Special shout-out to [OpenSky Network](https://opensky-network.org/) for their outstanding contribution to open aviation data and research.  
Their community-driven approach to transparent flight data has inspired many real-time data projects in the developer and data science ecosystem.

## License

MIT