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

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (Single Page Application handling UI & Session State)
- **Backend**: Java 21 & Spring Boot 4.1 (Built with Maven, no Lombok)
- **Authentication**: OAuth2 Resource Server (Validating JWTs from Next.js)
- **Database**: PostgreSQL (Leveraging JSONB for fast audio-timeline queries)
- **Real-Time Communication**: WebRTC (Powered by Java Virtual Threads for massive scalability)

## 🗄️ Database Schema Overview

The Postgres database consists of the following core tables:
- `users`: Stores user credentials, Google Auth details, and cool usernames.
- `song`: Stores metadata for all available songs.
- `session`: Manages active karaoke rooms/lobbies.
- `song_detail`: Contains the dynamic audio data (bass, echo, and effects) mapped to specific timestamps. Stored as **JSONB** for blazing-fast querying via GIN indexes.
- `session_users`: Maps users to their active sessions.

## 🔌 Backend Endpoints

| Endpoint | Description |
| :--- | :--- |
| **`1. /login`** | Authenticate users and return access tokens. |
| **`2. /signup`** | Register new users and set up their cool usernames. |
| **`3. /dashboard`** | Main user dashboard showing create or join buttons. |
| **`4. /create`** | Create a new karaoke session. |
| **`5. /join`** | Join an existing session via an invite ID. |
| **`6. /songlist`** | Retrieve the available list of songs to choose from. |
| **`7. /songdetail`** | see song specific details. |
| **`8. /karaokehouse`** | The core WebRTC signaling endpoint for real-time singing. | [This will need a lot of helper services.]
| **`9. /upload`** | *(Private)* Dev-only endpoint to upload new songs. |
| **`10. /moments`** | Triggered when the vibe is high; records a 30-second downloadable clip. |
