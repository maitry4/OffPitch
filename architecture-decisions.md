# Architecture Decisions

This document outlines the core architectural and tooling decisions for the OffPitch backend.

## 1. Build Tool: Maven (over Gradle)
**Decision**: We are using Maven instead of Gradle.
**Reasoning**: We want the setup to be as clean and straightforward as possible, focusing entirely on core feature development. Using Gradle (whether Groovy or Kotlin DSL) introduces a new language and additional configuration complexities that we prefer to avoid for this project.

## 2. Code Generation: No Lombok
**Decision**: We will write standard Java without the Lombok library.
**Reasoning**: We prioritize code predictability and ease of debugging. Even if the resulting code is longer (due to explicit getters, setters, and constructors), avoiding "magic" annotations ensures that every part of the application is transparent. We will maintain cleanliness by heavily modularizing the code instead.

## 3. Database: PostgreSQL (over MySQL or NoSQL)
**Decision**: We will use PostgreSQL, specifically leveraging its JSONB capabilities.
**Reasoning**: The database structure is cleanly relational by nature, ruling out NoSQL. However, the `song_detail` table needs to store complex, dynamic audio data (e.g., bass changes, echo markers, and visual effects mapped to specific timestamps). 
- **MySQL** treats JSON data mostly as basic text strings, making it slow to query or update specific nested properties.
- **Postgres (JSONB)** compresses JSON into a decomposed binary format. This allows us to store entire timelines of visual trigger effects right inside a single database row, and query inside that JSON data using GIN indexes with lightning speed.

## 4. Java Version: Java 21
**Decision**: We are using Java 21.
**Reasoning**: Java 21 introduces Virtual Threads, which is a game-changer for our WebRTC signaling and real-time features.
- **Java 17 (Thread-per-Request)**: Every user connection to the `/karaokehouse` WebSocket or `/moments` endpoint maps directly to a heavy operating system thread (consuming ~1MB of memory each). With 1,000 simultaneous users, the server eats 1GB of RAM just to hold connections open, leading to scaling bottlenecks.
- **Java 21 (Virtual Threads)**: These are lightweight threads managed by the Java runtime, taking up less than 1KB of memory. We can comfortably spin up 100,000 virtual threads on standard, cheap server hardware without breaking a sweat.

## 5. Spring Boot Version
**Decision**: We will use the latest stable **Spring Boot 4.1** release.
**Reasoning**: Spring Boot 4.1 is the latest stable release and fully supports Java 21's Virtual Threads out-of-the-box, allowing us to handle massive concurrent WebSocket connections for the `/karaokehouse` efficiently. It also includes the latest observability tools and SSRF mitigations, which is great for production readiness.

## 6. Authentication Architecture
**Decision**: We will configure Spring Boot as an **OAuth2 Resource Server** rather than an OAuth2 Client.
**Reasoning**: Since the frontend is a detached Single Page Application (SPA) built in Next.js, the Next.js app will handle the "Login with Google" flow directly to obtain a token (JWT). The Spring Boot backend will simply act as a Resource Server that validates this token on incoming API requests (`Authorization: Bearer <token>`). Trying to use Spring Boot as an OAuth2 Client to manage the Google redirect flow and session cookies for a completely separate Next.js frontend would be very difficult and introduce unnecessary CORS and cookie-handling complexity.
