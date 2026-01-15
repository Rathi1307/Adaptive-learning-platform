import { PrismaClient } from "@prisma/client";

// Added a version suffix to force a new client instance when schema changes
const PRISMA_VERSION = "v2";
const globalForPrisma = global as unknown as { [key: string]: PrismaClient };

export const prisma =
    globalForPrisma[`prisma_${PRISMA_VERSION}`] ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma[`prisma_${PRISMA_VERSION}`] = prisma;
