import type { Request, Response } from 'express';
import { envoltorioAsync } from '../../shared/middlewares/async-handler';
import type { LoginInput, RegistroInput } from './auth.schema';
import * as servicioAuth from './auth.service';

export const registrar = envoltorioAsync(async (req: Request, res: Response) => {
  const resultado = await servicioAuth.registrar(req.body as RegistroInput);
  res.status(201).json({ datos: resultado });
});

export const login = envoltorioAsync(async (req: Request, res: Response) => {
  const resultado = await servicioAuth.login(req.body as LoginInput);
  res.status(200).json({ datos: resultado });
});

export const obtenerPerfil = envoltorioAsync(async (req: Request, res: Response) => {
  // biome-ignore lint/style/noNonNullAssertion: el middleware `autenticar` de la ruta garantiza que req.user está definido.
  const usuario = await servicioAuth.obtenerPerfil(req.user!.id);
  res.status(200).json({ datos: usuario });
});
