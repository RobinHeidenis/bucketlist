import { PrismaClient } from '@prisma/client';
import { env } from '~/env.mjs';
import { Client } from '@planetscale/database';
import { fetch as undiciFetch } from 'undici';
import { PrismaPlanetScale } from '@prisma/adapter-planetscale';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const client = new Client({ url: env.DATABASE_URL, fetch: undiciFetch });
const adapter = new PrismaPlanetScale(client);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
