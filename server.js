import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import app from './app.js';

const config = dotenv.config();
const prisma = new PrismaClient()
const PORT = process.env.PORT || 8000;

// Graceful shutdown: disconnect Prisma when the application is shutting down
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing Prisma connection');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing Prisma connection');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`server running now on http://localhost:${PORT}`);
})
