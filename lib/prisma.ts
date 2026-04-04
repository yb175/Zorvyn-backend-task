import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`

console.log('[Prisma] Initializing connection...');
console.log('[Prisma] Database URL (host only):', connectionString?.split('?')[0]?.replace(/:[^@]*@/, ':***@') || 'NOT SET');

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ 
  adapter,
  log: [
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ]
})

process.on('exit', async () => {
  console.log('[Prisma] Closing connection...');
  await prisma.$disconnect();
});

console.log('[Prisma] Client initialized successfully');

export { prisma }