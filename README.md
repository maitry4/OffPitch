# 🎤 OffPitch

**The web-based, frictionless, minimal karaoke experience.**

OffPitch is your invite-only party hub. Create a session, share the ID with your friends, and start singing together. Choose songs, experience real-time audio effects, and capture the best 30-second "Moments" to share anywhere!

## ✨ Features

- **Google Login**: Seamlessly log in with Google or register.
- **Frictionless Sessions**: Start an invite-only party in seconds. The creator simply makes a session, hits start, and shares the unique ID for friends to join.
- **Real-Time Karaoke**: Sing your heart out in the WebRTC-powered Karaoke House. 
- **Song Details & Effects**: View details about a song before you pick it, bass and echo details to trigger dynamic audio and visual effects as the music plays.
- **Capture Moments**: When the vibe is high, anyone in the session can hit the "Moments" button to record a 30-second Instagram Reel-ready clip. Download and share it instantly, or keep it forever.

## 🔜 Upcoming Features

- **Singing Star**: A game-like interactive feature where a dynamic star appears over the head of the person who is currently singing, naturally passing the spotlight and keeping the party engaged!

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 + Tailwind CSS 4 | SPA handling UI, routing & session state |
| **Backend** | Java 21 + Spring Boot 4.1 (Maven) | Virtual Threads for massive WebSocket concurrency |
| **Auth** | NextAuth (Better Auth) → OAuth2 Resource Server | Frontend gets Google JWT; backend validates it |
| **Database** | PostgreSQL (Supabase) | JSONB + GIN indexes for audio timeline data |
| **Migrations** | Flyway | Version-controlled SQL migrations in the codebase |
| **Real-Time** | WebRTC | Peer-to-peer audio/video with Spring WebSocket signaling |
---

## 🗄️ Database Schema

The Postgres database consists of the following core tables:

| Table | Purpose |
| :--- | :--- |
| `users` | User credentials, Google Auth details, and usernames |
| `song` | Metadata for all available karaoke songs |
| `session` | Active karaoke rooms / lobbies |
| `song_detail` | Dynamic audio data (bass, echo, visual effects) mapped to timestamps — stored as **JSONB** with GIN indexes |
| `session_users` | Maps users to their active sessions |

### Database Migrations (Flyway)

Schema is managed through **Flyway** migrations — versioned SQL files that live in the codebase, not in the Supabase dashboard. This means:

- Schema changes are version-controlled alongside your code
- Switching databases (Supabase → Railway, self-hosted Postgres, etc.) just works
- Every developer gets an identical schema by simply running the app
- Every migration is recorded in a `flyway_schema_history` table (built-in audit trail)

Migration files live in:
```
backend/src/main/resources/db/migration/
  V1__create_users_table.sql
  V2__create_song_table.sql
  V3__create_session_tables.sql
  ...
```

> **You never need to manually create tables in Supabase.** Flyway runs on application startup and applies any pending migrations automatically.

---

## 🔌 Backend API Endpoints

| # | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| 1 | `/api/auth/login` | POST | Validate Google JWT and return access tokens |
| 2 | `/api/auth/signup` | POST | Register new users with a chosen username |
| 3 | `/api/dashboard` | GET | User dashboard — create or join options |
| 4 | `/api/sessions` | POST | Create a new karaoke session |
| 5 | `/api/sessions/{id}/join` | POST | Join an existing session via invite ID |
| 6 | `/api/songs` | GET | List available songs to choose from |
| 7 | `/api/songs/{id}` | GET | Song detail — audio timeline, effects data |
| 8 | `/ws/karaoke/{sessionId}` | WS | WebRTC signaling endpoint for real-time singing |
| 9 | `/api/songs/upload` | POST | *(Dev-only)* Upload new songs |
| 10 | `/api/moments` | POST | Record a 30-second downloadable clip |

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** (JDK)
- **Node.js 20+** and npm
- **A Supabase project** (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/maitry4/OffPitch.git
cd OffPitch
```

### 2. Backend Setup

```bash
cd backend

# Copy and fill in environment variables
cp env.example .env
# Edit .env with your Supabase credentials (see env.example for instructions)

# Run the Spring Boot app (Flyway will auto-create all tables)
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd frontend/offpitch

# Install dependencies
npm install

# Copy and fill in environment variables
cp env.example .env
# Edit .env with your Google OAuth credentials (see env.example for instructions)

# Start the dev server
npm run dev
```

The frontend starts on `http://localhost:3000`.

---

## 📁 Project Structure

```
OffPitch/
├── backend/                          # Java 21 + Spring Boot 4.1
├── frontend/offpitch/                # Next.js 16
├── architecture-decisions.md         # Why Maven, no Lombok, Postgres, etc.
├── java-vs-fastapi.md                # Why Java over Python for this app
└── README.md                         # You are here
```

---

## 📄 License

This project is currently private and not licensed for distribution.
