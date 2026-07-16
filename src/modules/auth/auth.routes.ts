import { Router } from 'express';
import { autenticar } from '../../shared/middlewares/auth.middleware';
import { validar } from '../../shared/middlewares/validate-schema';
import * as controladorAuth from './auth.controller';
import { loginSchema, registrarSchema } from './auth.schema';

export const enrutadorAuth = Router();

enrutadorAuth.post('/register', validar(registrarSchema, 'body'), controladorAuth.registrar);
enrutadorAuth.post('/login', validar(loginSchema, 'body'), controladorAuth.login);
enrutadorAuth.get('/me', autenticar, controladorAuth.obtenerPerfil);
