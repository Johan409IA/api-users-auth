import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';
import { logger } from './logger.js';

// Prisma 7 con engine "client" requiere un driver adapter explícito.
// PrismaPg envuelve el driver nativo de node-postgres (pg) para PostgreSQL.
const adaptadorPg = new PrismaPg({ connectionString: env.DATABASE_URL });

// Singleton de PrismaClient para evitar agotar el pool de conexiones en dev
// con el hot-reload de tsx watch.
const prismaGlobal = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  prismaGlobal.prisma ??
  new PrismaClient({
    adapter: adaptadorPg,
    log: [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  });

if (env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma;
}

// Los handlers se registran sin tipado explícito porque el provider "prisma-client"
// no emite declaraciones; con un cast al tipo del evento evitamos el `any` implícito.
prisma.$on('warn' as never, (evento: unknown) =>
  logger.warn({ prisma: evento }, 'Advertencia de Prisma'),
);
prisma.$on('error' as never, (evento: unknown) =>
  logger.error({ prisma: evento }, 'Error de Prisma'),
);

// Verifica que la conexión a PostgreSQL funcione antes de levantar el servidor.
// Lanza el error si falla, lo capturamos en server.ts para abortar el arranque.
export async function verificarConexionBaseDeDatos(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
