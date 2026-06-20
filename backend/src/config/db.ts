import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Helper to check connection health
export const checkDbConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL database connection established successfully via Prisma Client');
    return true;
  } catch (error) {
    console.error('Failed to connect to the database via Prisma:', error);
    return false;
  }
};
export const db = prisma; // Alias for backward compatibility if needed
