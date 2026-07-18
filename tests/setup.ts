import 'dotenv/config';
import { vi } from 'vitest';

// Estas asignaciones DEBEN ocurrir antes de que cualquier módulo cree un PrismaClient.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL!;
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'clave-secreta-de-32-caracteres-minimo!!';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';

// Mock de express-rate-limit: el store en memoria causa falsos 429 en tests.
// vi.mock se hoistea por vitest, ejecutándose antes de cualquier import del módulo.
vi.mock('express-rate-limit', () => ({
  default: (_opciones: unknown) => (_req: unknown, _res: unknown, next: () => void) => {
    next();
  },
}));
