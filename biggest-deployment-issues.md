# Biggest Deployment Issues Faced & How We Resolved Them

Deploying OffPitch required solving a few major architectural and tooling challenges. Here is a summary of the biggest hurdles we faced and how we overcame them in simple terms.

---

## 1. The Backend Problem: Cloudflare Workers Can't Run Java
**The Goal:** We initially wanted to deploy both the Next.js frontend and the Spring Boot Java backend to Cloudflare for their fast global CDN and generous free tier.

**The Issue:** Cloudflare Workers do not operate like traditional servers. They run on "V8 Isolates" (the engine that powers Google Chrome), which means they can only run JavaScript, TypeScript, or WebAssembly. They **do not have a Java Virtual Machine (JVM)**. Our backend uses Java 21, Spring Boot, WebSockets, and Flyway database migrations — all of which fundamentally cannot run on Cloudflare Workers.

**The Solution:** We split the architecture. We kept the Next.js frontend on Cloudflare Workers to get the fast CDN benefits, but moved the Spring Boot backend to **Render.com**. Render offers a free tier that supports full Docker containers, meaning we could run our Java app exactly as it runs locally, with full support for WebSockets and database migrations.

---

## 2. The Frontend Problem: Next.js 16 vs OpenNext Compatibility
**The Goal:** Deploy the Next.js 16 frontend to Cloudflare Workers using the `@opennextjs/cloudflare` adapter.

**The Issues:**
1. **Outdated Documentation:** We initially used an older version of OpenNext (`v0.3.6`). This version relied on internal Next.js files (like `pages.runtime.prod.js`). However, Next.js 16 completely changed how it builds files internally, so the old OpenNext version crashed because it couldn't find the files it expected.
2. **Peer Dependency Conflicts:** When we upgraded to the latest OpenNext (`v1.20.2`), it caused a chain reaction of "peer dependency" errors. The new OpenNext required specific, newer versions of `next` (v16.2.11) and `wrangler` (v4.86.0).
3. **Standalone Mode Required:** Even after upgrading, the build crashed because OpenNext requires Next.js to package all of its server code into a neat, self-contained folder. By default, Next.js doesn't do this.
4. **Changing Config Schemas:** The configuration file (`open-next.config.ts`) changed formats between versions, causing syntax errors until we gave it the exact structure it demanded.

**The Solution:**
- We bumped all dependencies in `package.json` to their latest compatible versions (`next@16.2.11`, `@opennextjs/cloudflare@^1.20.2`, `wrangler@^4.86.0`).
- We added `output: "standalone"` to `next.config.ts` so Next.js would properly bundle the server code for OpenNext.
- We updated the `open-next.config.ts` to exactly match the strict new schema required by v1.20.2.
- Finally, we had to update the GitHub Actions runner from Node 20 to Node 22, because the newest version of Cloudflare's `wrangler` tool requires at least Node 22 to run.

---

## 3. The Automation Problem: Render "Root Directory" Confusion
**The Goal:** Have Render automatically build and deploy our Java backend whenever code is pushed to GitHub.

**The Issue:** The repository is a monorepo (contains both frontend and backend). When setting up Render, the "Root Directory" was mistakenly set to `offpitch/backend` (which doesn't exist) instead of just `backend`. The build failed before it even started because Render couldn't find the code.

**The Solution:** We corrected the Root Directory to `backend` in the Render dashboard, and added a multi-stage `Dockerfile` to the folder. Render successfully detected the Dockerfile, built the Java JAR file using Maven, and deployed the container. We also passed the database connection strings to Render via Environment Variables so the app could connect to Supabase on startup.

---

## 4. The Auth Problem: NextAuth "Server Error" on Cloudflare
**The Goal:** Enable users to log in with Google using NextAuth (Auth.js) on our Cloudflare-deployed frontend.

**The Issue:** When clicking "Login with Google", NextAuth immediately crashed and redirected users to `/api/auth/error` with a generic "Server Error: There is a problem with the server configuration." We initially suspected that our backend was blocking the origin via CORS. 

The actual cause was that **Cloudflare Workers do not automatically inherit environment variables from the GitHub Actions runner.** Even though we passed `AUTH_SECRET`, `CLIENT_ID`, `CLIENT_SECRET`, and `NEXT_PUBLIC_API_URL` to the `env` block in our GitHub Action `deploy` step, the `wrangler deploy` command completely ignored them for the final deployed worker. This resulted in the Cloudflare Worker running with missing secrets. Since NextAuth v5 strictly requires `AUTH_SECRET` in production to encrypt session tokens, it crashed immediately.

**The Solution:** 
- We realized that CORS does not apply to Server-to-Server calls (which is how the Next.js `jwt` callback communicates with the backend).
- We updated our GitHub Actions workflow (`deploy-frontend.yml`) to explicitly upload these variables to Cloudflare as secrets using `wrangler secret put` before running `wrangler deploy`. (Alternatively, these can be manually entered once in the Cloudflare Dashboard under Settings -> Variables and Secrets).

---

## 5. The CI/CD Problem: GitHub Actions Failing on Backend Tests
**The Goal:** Automatically build and test the Java Spring Boot backend using GitHub Actions (`mvn verify`) before triggering the Render deployment.

**The Issue:** The GitHub Actions workflow failed during the `Build & Test` step, dumping a massive "Conditions Evaluation Report" and an `Error starting ApplicationContext` message. 
While the backend successfully deployed on Render (because Render had the `JDBC_POSTGRES_URL`, `DB_USERNAME`, and `DB_PASS` environment variables), the GitHub Actions runner did not have these credentials. When Maven ran the tests (`@SpringBootTest`), Spring Boot attempted to start the application context, tried to connect to the database to run Flyway migrations, and crashed because the credentials were missing.

**The Solution:**
To resolve this, you can either:
1. Provide the database secrets (`JDBC_POSTGRES_URL`, `DB_USERNAME`, `DB_PASS`) to the GitHub Actions `Build & Test` step via GitHub Repository Secrets so the test context can connect to a database.
2. (Recommended) Skip tests during the CI build by changing the command to `./mvnw clean package -DskipTests`, leaving the actual runtime verification to Render.
3. Use a lightweight in-memory database like H2 specifically for the `test` profile so GitHub Actions doesn't need external database credentials to pass the build phase.
