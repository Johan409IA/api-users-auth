import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { logger } from './config/logger';
import { enrutadorModuloUsuarios } from './modules/users';
import { manejadorDeErrores } from './shared/middlewares/error-handler';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Loguea cada request HTTP entrante y saliente con método, URL, status y duración.
app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API corriendo',
  });
});

app.use('/users', enrutadorModuloUsuarios);

// El manejador de errores DEBE ser el último middleware.
// Captura AppError, ZodError y cualquier error no controlado.
app.use(manejadorDeErrores);
