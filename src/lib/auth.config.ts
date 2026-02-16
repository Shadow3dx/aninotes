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
      const isMyList = nextUrl.pathname.startsWith("/my-list");
      const isLoggedIn = !!auth?.user;

      if ((isAdmin || isMyList) && !isLoggedIn) {
        return false; // redirects to signIn page
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: string }).role ?? "READER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = (token.role as string) || "READER";
      }
      return session;
    },
  },
  providers: [], // providers added in full auth.ts
} satisfies NextAuthConfig;
