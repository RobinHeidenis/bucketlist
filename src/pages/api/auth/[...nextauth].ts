import NextAuth from 'next-auth';
import { authOptions } from '~/server/auth';
// Prisma adapter for NextAuth, optional and can be removed

export default NextAuth(authOptions);
