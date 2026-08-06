# 🎤 OffPitch

**The web-based, frictionless, minimal karaoke experience.**

OffPitch is your invite-only party hub. Create a session, share the ID with your friends, and start singing together. Choose songs, experience real-time audio effects, and capture the best 30-second "Moments" to share anywhere!

🔗 **Live Application:** [https://offpitch.probmaitry.workers.dev/](https://offpitch.probmaitry.workers.dev/)  
🔗 **Backend API:** [https://offpitch-k5vo.onrender.com](https://offpitch-k5vo.onrender.com)

## ✨ Features

- **Google Login**: Seamlessly log in with Google or register.
- **Frictionless Sessions**: Start an invite-only party in seconds. The creator simply makes a session, hits start, and shares the unique ID for friends to join.
- **Real-Time Karaoke**: Sing your heart out in the WebRTC-powered Karaoke House. 
- **Song Details & Effects**: View details about a song before you pick it, bass and echo details to trigger dynamic audio and visual effects as the music plays.
- **Capture Moments**: When the vibe is high, anyone in the session can hit the "Moments" button to record a 30-second Instagram Reel-ready clip. Download and share it instantly, or keep it forever.

## 🔜 Upcoming Features

- **Singing Star**: A game-like interactive feature where a dynamic star appears over the head of the person who is currently singing, naturally passing the spotlight and keeping the party engaged!

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Deployment | Why |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 + Tailwind 4 | **Cloudflare Workers** (via OpenNext) | Fast edge CDN delivery, full SSR support |
| **Backend** | Java 21 + Spring Boot 4.1 | **Render.com** (Docker container) | Virtual Threads for WebSocket concurrency; JVM compatibility |
| **Database** | PostgreSQL | **Supabase** | JSONB + GIN indexes for audio timeline data |
| **Media CDN** | Cloudinary | **Cloudinary** | Fast MP3 delivery |
| **Auth** | NextAuth → OAuth2 | Cloudflare ↔ Render | Frontend gets Google JWT; backend validates it |

---

## 🗄️ Database Schema

The Postgres database consists of the following core tables:

| Table | Purpose |
| :--- | :--- |
| `users` | User credentials, Google Auth details, and usernames |
| `song` | Metadata for all available karaoke songs |
| `session` | Active karaoke rooms / lobbies, including real-time playback state (current song, timestamps, pause state) |
| `song_detail` | Dynamic audio data (bass, echo, visual effects) mapped to timestamps |
| `session_users` | Maps users to their active sessions |

### Database Migrations (Flyway)
Schema is managed through **Flyway** migrations. Migration files live in:
`backend/src/main/resources/db/migration/`

> **You never need to manually create tables in Supabase.** Flyway runs on application startup and applies any pending migrations automatically.

---

## 🚀 Deployment (CI/CD)

The project uses **GitHub Actions** for automated deployments. Workflows are located in `.github/workflows/`. Both workflows can run automatically on `push` to `main`, or can be triggered manually via the **workflow_dispatch** button in the GitHub Actions UI.

### Frontend (Cloudflare Workers)
- Built using `@opennextjs/cloudflare` in `standalone` output mode.
- Deployed via Cloudflare `wrangler` v4 using Node 22.
- Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets.

### Backend (Render.com)
- Built using a multi-stage `Dockerfile` (Maven build → JRE runtime).
- Listens on the dynamic `$PORT` provided by Render.
- CORS dynamically allows traffic from the Cloudflare frontend via the `ALLOWED_ORIGINS` environment variable on Render.

For a detailed look at the challenges faced during deployment, read: [`biggest-deployment-issues.md`](biggest-deployment-issues.md).

---

## 💻 Local Development Setup

### Prerequisites
- **Java 21** (JDK)
- **Node.js 22+** and npm
- **A Supabase project** (free tier works)

### 1. Backend Setup
```bash
cd backend
cp env.example .env
# Edit .env with your Supabase URL, Google Client ID, etc.
./mvnw spring-boot:run
```
Backend starts on `http://localhost:8080`.

### 2. Frontend Setup
```bash
cd frontend/offpitch
npm install
cp .dev.vars .env.local
# Edit .env.local with your NextAuth secret and Google OAuth credentials
npm run dev
```
Frontend starts on `http://localhost:3000`.

---

## 📄 License

This project is currently private and not licensed for distribution.
