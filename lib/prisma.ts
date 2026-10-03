import { PrismaClient } from "@prisma/client";

// Next.js dev mode hot-reloads files often. Without this guard, every reload
// would create a brand-new PrismaClient (and a new DB connection). We stash
// one instance on the global object and reuse it.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
