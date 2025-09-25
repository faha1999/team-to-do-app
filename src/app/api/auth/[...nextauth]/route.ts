// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * NextAuth credentials-based auth
 * - No paid providers, everything local with Prisma
 * - Stores a lightweight role claim inside the JWT
 * - Expects a User record with fields: id, email, name, passwordHash, image, role
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 }, // 30 days
  pages: {
    signIn: '/(auth)/login',
    // error: "/(auth)/login", // optional: centralize errors
  },
  providers: [
    Credentials({
      name: 'Email & Password',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'name@company.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            passwordHash: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? '',
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist role on sign-in; keep existing on subsequent calls
      if (user && 'role' in user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role ?? 'USER';
      }
      return session;
    },
  },
  // You can set cookies, secrets, etc. via env:
  // NEXTAUTH_SECRET must be defined in .env for JWT encryption
};

const handler = NextAuth(authOptions);

// App Router expects these named exports:
export { handler as GET, handler as POST };

// Optional: make sure this route is always dynamic (no caching)
export const dynamic = 'force-dynamic';
