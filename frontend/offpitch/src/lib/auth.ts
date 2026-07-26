import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    /**
     * After Google sign-in succeeds, forward the Google ID token
     * to our Spring Boot backend so it can upsert the user.
     */
    async jwt({ token, account }) {
      if (account?.id_token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: account.id_token }),
          });

          if (res.ok) {
            const user = await res.json();
            token.backendId = user.id;
            token.username = user.username;
          }
        } catch (err) {
          console.error("Failed to sync user with backend:", err);
        }
      }
      return token;
    },

    /** Expose backend fields to the client-side session. */
    async session({ session, token }) {
      session.user.id = (token.backendId as string) ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).username = (token.username as string) ?? "";
      return session;
    },
  },
});
