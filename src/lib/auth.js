import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Test Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV !== 'development') return null;
        if (credentials.username === 'testuser' && credentials.password === 'test1234') {
          return { id: 'test-user-001', name: 'Test User', email: 'test@myrashifal.in' };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userId = user.id;
      }
      // Resolve role on sign-in or when missing
      if (!token.role || trigger === 'signIn') {
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
        if (token.email && adminEmails.includes(token.email.toLowerCase())) {
          token.role = 'admin';
        } else {
          try {
            const client = await clientPromise;
            const db = client.db('myrashifal');
            const astrologer = await db.collection('astrologers').findOne({
              userId: token.userId || token.sub,
              status: 'approved',
            });
            token.role = astrologer ? 'astrologer' : 'user';
          } catch {
            token.role = 'user';
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user.id = token.userId;
      }
      session.user.role = token.role || 'user';
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
