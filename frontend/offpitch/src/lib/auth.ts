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
    async jwt({ token, account, profile }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }

      if (profile) {
        token.name = profile.name ?? token.name;
        token.email = profile.email ?? token.email;
        token.picture = (profile as { picture?: string }).picture ?? token.picture;
      }

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
            token.username = user.username || user.name || "";
            token.name = user.name || token.name;
          }
        } catch (err) {
          console.error("Failed to sync user with backend:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = (token.backendId as string) ?? "";
      session.user.name = (token.name as string) ?? session.user.name ?? "";
      session.user.email = (token.email as string) ?? session.user.email ?? "";
      session.user.image = (token.picture as string) ?? session.user.image ?? "";
      session.username = (token.username as string) ?? "";
      session.idToken = (token.idToken as string) ?? "";
      return session;
    },
  },
});
