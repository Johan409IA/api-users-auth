import type { Request, Response } from 'express';
import { envoltorioAsync } from '../../shared/middlewares/async-handler';
import type { LoginInput, RegistroInput } from './auth.schema';
import * as servicioAuth from './auth.service';

export const registrar = envoltorioAsync(async (req: Request, res: Response) => {
  const resultado = await servicioAuth.registrar(req.body as RegistroInput);
  req.log.info(
    {
      evento: 'auth',
      tipo: 'registro',
      usuarioId: resultado.usuario.id,
      email: resultado.usuario.email,
    },
    'Registro exitoso',
  );
  res.status(201).json({ datos: resultado });
});

export const login = envoltorioAsync(async (req: Request, res: Response) => {
  const { email } = req.body as LoginInput;
  try {
    const resultado = await servicioAuth.login(req.body as LoginInput);
    req.log.info(
      {
        evento: 'auth',
        tipo: 'login_success',
        usuarioId: resultado.usuario.id,
        email,
      },
      'Login exitoso',
    );
    res.status(200).json({ datos: resultado });
  } catch (error) {
    req.log.warn({ evento: 'auth', tipo: 'login_fail', email }, 'Login fallido');
    throw error;
  }
});

export const obtenerPerfil = envoltorioAsync(async (req: Request, res: Response) => {
  // biome-ignore lint/style/noNonNullAssertion: el middleware `autenticar` garantiza req.user.
  const usuario = await servicioAuth.obtenerPerfil(req.user!.id);
  res.status(200).json({ datos: usuario });
});
