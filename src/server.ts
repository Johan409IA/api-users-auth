import { app } from './app';
import { prisma, verificarConexionBaseDeDatos } from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

async function iniciarServidor(): Promise<void> {
  try {
    await verificarConexionBaseDeDatos();
    logger.info('Conexion a la base de datos establecida correctamente');
  } catch (error) {
    logger.fatal({ error }, 'No se pudo conectar a la base de datos. Abortando arranque.');
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }

  const servidor = app.listen(env.PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${env.PORT}`);
  });

  const cerrar = async (señal: string): Promise<void> => {
    logger.info(`Señal ${señal} recibida. Cerrando servidor...`);
    servidor.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void cerrar('SIGTERM'));
  process.on('SIGINT', () => void cerrar('SIGINT'));
}

void iniciarServidor();
