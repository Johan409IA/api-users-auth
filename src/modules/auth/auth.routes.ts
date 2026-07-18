import { Router } from 'express';
import { autenticar } from '../../shared/middlewares/auth.middleware.js';
import { limiteAuth } from '../../shared/middlewares/rate-limit.js';
import { validar } from '../../shared/middlewares/validate-schema.js';
import * as controladorAuth from './auth.controller.js';
import { loginSchema, registrarSchema } from './auth.schema.js';

export const enrutadorAuth = Router();

enrutadorAuth.post(
  '/register',
  limiteAuth,
  validar(registrarSchema, 'body'),
  controladorAuth.registrar,
);
enrutadorAuth.post('/login', limiteAuth, validar(loginSchema, 'body'), controladorAuth.login);
enrutadorAuth.get('/me', autenticar, controladorAuth.obtenerPerfil);
