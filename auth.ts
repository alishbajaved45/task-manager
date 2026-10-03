import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // This function runs on the SERVER when someone submits the login form.
      // It never runs in the browser, so it's safe to query the database here.
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null; // don't reveal whether the email exists

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        // Whatever is returned here becomes `user` in the jwt() callback below.
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" }, // no separate Session table needed
  pages: { signIn: "/login" },
  callbacks: {
    // Copy the user's id onto the JWT the first time they sign in...
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // ...then copy it from the JWT onto the session object, so
    // `session.user.id` is available everywhere we call auth().
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
