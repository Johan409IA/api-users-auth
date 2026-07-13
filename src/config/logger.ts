import { pino } from 'pino';
import { env } from './env';

// Logger centralizado. Usa Pino en producción (JSON puro, ideal para Render)
// y agrega legibilidad en desarrollo si pino-pretty está instalado.
export const logger = pino({
  name: 'api-users-render',
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
    },
  }),
});
