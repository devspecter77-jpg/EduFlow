import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Prisma Client Singleton
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Always create fresh instance in development to pick up schema changes
const prisma = env.NODE_ENV === 'production'
  ? (globalThis.prisma ?? prismaClientSingleton())
  : prismaClientSingleton();

if (env.NODE_ENV === 'production') globalThis.prisma = prisma;

// Export named export
export { prisma };
export default prisma;

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    process.stdout.write('[DB] Connected successfully\n');
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[DB] Connection failed: ${message}\n`);
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  process.stdout.write('[DB] Disconnected\n');
};
