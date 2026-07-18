import { pino } from 'pino';
import { env } from './env';

// Logger centralizado. Usa Pino en produccion (JSON puro, ideal para Render)
// y agrega legibilidad en desarrollo si pino-pretty esta instalado.
export const logger = pino({
  name: 'api-users-render',
  level: env.LOG_LEVEL === 'silent' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
  base: { env: env.NODE_ENV, service: 'api-users-render' },
  // Redaccion de datos sensibles: nunca loguear passwords, tokens, cabeceras
  // de autenticacion o cookies, sin importar en que nivel del objeto aparezcan.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'password',
      'token',
      '[*].password',
      '[*].token',
    ],
    censor: '[REDACTED]',
  },
  ...(env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
    },
  }),
});
