import type { NextAuthConfig } from "next-auth";

// Edge-compatible config (no Prisma, no bcrypt)
// Used by middleware only
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAdmin = nextUrl.pathname.startsWith("/admin");
      const isLoggedIn = !!auth?.user;

      if (isAdmin && !isLoggedIn) {
        return false; // redirects to signIn page
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // providers added in full auth.ts
} satisfies NextAuthConfig;
