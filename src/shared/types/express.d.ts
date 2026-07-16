import type { UsuarioAutenticado } from '../../modules/auth/auth.types';

// Augmentation del core de Express para tipar `req.user` (opcional: solo el
// middleware `autenticar` lo popula tras verificar el JWT). Se augmenta
// 'express-serve-static-core' en lugar de `declare global` para no depender de
// que @types/express esté en el array `types` de tsconfig.
declare module 'express-serve-static-core' {
  interface Request {
    user?: UsuarioAutenticado;
  }
}
