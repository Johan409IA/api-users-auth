import type { IncomingMessage, ServerResponse } from 'node:http';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { enrutadorModuloAuth } from './modules/auth';
import { enrutadorModuloUsuarios } from './modules/users';
import { manejadorDeErrores } from './shared/middlewares/error-handler';
import { manejarRutaNoEncontrada } from './shared/middlewares/not-found';
import { limiteGlobal } from './shared/middlewares/rate-limit';

export const app = express();

// Helmet con configuración explícita: CSP desactivada (API JSON, no HTML),
// HSTS solo en producción, referrer policy estricto.
app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts:
      env.NODE_ENV === 'production'
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
  }),
);
app.use(cors({ origin: env.CORS_ORIGIN }));
// Límite de body para mitigar DoS por payloads enormes.
app.use(express.json({ limit: '10kb' }));

// Loguea cada request HTTP con método, URL, status, duración y contexto.
// customProps agrega requestId y usuario autenticado a cada log.
app.use(
  pinoHttp({
    logger,
    customProps: (req: IncomingMessage, _res: ServerResponse) => {
      const r = req as Request;
      return {
        requestId: r.id as string,
        usuario: r.user ? { id: r.user.id, rol: r.user.rol } : undefined,
      };
    },
  }),
);

// Exponer el requestId en la respuesta para trazabilidad del cliente.
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Request-Id', req.id as string);
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API corriendo',
  });
});

// Rate limit global aplicado solo a rutas /api/* (no a /health).
app.use('/api', limiteGlobal);

// Todas las rutas de la API se montan bajo el prefijo /api.
app.use('/api/users', enrutadorModuloUsuarios);
app.use('/api/auth', enrutadorModuloAuth);

// 404 para rutas no reconocidas. Va antes del manejador de errores y no loggea
// para evitar ruido de bots/escáneres en producción.
app.use(manejarRutaNoEncontrada);

// El manejador de errores DEBE ser el último middleware.
// Captura AppError, ZodError y cualquier error no controlado.
app.use(manejadorDeErrores);
