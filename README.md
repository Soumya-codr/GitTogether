# 🔗 GitTogether

> *The place where developers don't just network — they build, grow, and connect through code.*

GitTogether is a platform that brings developers together based on their GitHub profiles and tech stacks. Users can connect for professional networking, project collaboration, learning, or dating.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js with GitHub OAuth |
| Hosting | Vercel (Frontend) + Railway (Backend + DB) |

## Features

- 🔐 **GitHub OAuth** — one-click sign-in, auto-profile generation
- ⚡ **Tech Stack Extraction** — analyzes your repos, finds your top languages
- 🃏 **Swipe Deck** — drag-gesture card matching with Framer Motion
- 🧠 **Compatibility Score** — 4-factor algorithm (stack overlap, repo domain, activity, intent)
- 💬 **Real-time Chat** — polling-based messaging with code snippet support
- 🔒 **Privacy Controls** — hide location, hide dating mode
- 🎯 **3 Modes** — Networking | Collaboration | Dating

---

## Getting Started

### 1. Create a GitHub OAuth App

Go to [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**

- **Homepage URL**: `http://localhost:3000`
- **Callback URL**: `http://localhost:3000/api/auth/callback/github`

Copy your `Client ID` and `Client Secret`.

---

### 2. Set Up the Backend

```bash
cd server
cp .env.example .env
# Fill in .env with your DB URL, GitHub credentials, and JWT secret
npm install
npx prisma migrate dev --name init
npm run dev
```

Server will start on **http://localhost:5000**

---

### 3. Set Up the Frontend

```bash
cd client
cp .env.example .env.local
# Fill in .env.local with your GitHub credentials and NEXTAUTH_SECRET
npm install
npm run dev
```

Frontend will start on **http://localhost:3000**

---

## Project Structure

```
Git_Together version revamped/
├── client/                    # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── discover/          # Swipe deck (SwipeCard + page)
│   │   ├── matches/           # Match dashboard
│   │   ├── chat/[matchId]/    # Real-time chat
│   │   └── api/auth/          # NextAuth route
│   └── components/
│       └── Navbar.tsx
│
└── server/                    # Express Backend
    ├── server.js              # Entry point
    ├── prisma/schema.prisma   # Database models
    ├── routes/                # auth, users, discover, swipes, matches, messages
    ├── services/              # githubService, matchingService
    ├── middleware/            # requireAuth
    └── lib/                   # prisma client, jwt utils
```

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sync` | POST | Sync GitHub user to DB |
| `/api/users/me` | GET | Current user profile |
| `/api/users/me` | PATCH | Update intent/privacy |
| `/api/discover` | GET | Scored swipe deck |
| `/api/swipes` | POST | Record swipe + check match |
| `/api/matches` | GET | All matches |
| `/api/messages/:matchId` | GET | Chat history |
| `/api/messages/:matchId` | POST | Send message |

---

## Compatibility Algorithm

```
Score = (Tech Stack Overlap × 40%)
      + (Repo Domain Similarity × 20%)
      + (Activity Frequency Match × 20%)
      + (Intent Alignment × 20%)
```

Profiles with **score > 60%** are prioritized in the swipe deck.

---

## Post-MVP Roadmap

- [ ] WebSocket real-time chat (Socket.io)
- [ ] AI compatibility descriptions
- [ ] Hackathon auto-team-builder
- [ ] GitHub contribution leaderboard
- [ ] Dev events integration
- [ ] Mobile app (React Native)
