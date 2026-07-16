import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { enrutadorModuloAuth } from './modules/auth';
import { enrutadorModuloUsuarios } from './modules/users';
import { manejadorDeErrores } from './shared/middlewares/error-handler';
import { manejarRutaNoEncontrada } from './shared/middlewares/not-found';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Loguea cada request HTTP entrante y saliente con método, URL, status y duración.
app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API corriendo',
  });
});

// Todas las rutas de la API se montan bajo el prefijo /api.
app.use('/api/users', enrutadorModuloUsuarios);
app.use('/api/auth', enrutadorModuloAuth);

// 404 para rutas no reconocidas. Va antes del manejador de errores y no loggea
// para evitar ruido de bots/escáneres en producción.
app.use(manejarRutaNoEncontrada);

// El manejador de errores DEBE ser el último middleware.
// Captura AppError, ZodError y cualquier error no controlado.
app.use(manejadorDeErrores);
