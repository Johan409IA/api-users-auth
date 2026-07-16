// Importar pino-http para que TypeScript reconozca req.log y req.id.
import 'pino-http';
import type { UsuarioAutenticado } from '../../modules/auth/auth.types';

// Augmentation del core de Express para tipar `req.user` (opcional: solo el
// middleware `autenticar` lo popula tras verificar el JWT). Se augmenta
// 'express-serve-static-core' en lugar de `declare global` para no depender de
// que @types/express este en el array `types` de tsconfig.
declare module 'express-serve-static-core' {
  interface Request {
    user?: UsuarioAutenticado;
  }
}
