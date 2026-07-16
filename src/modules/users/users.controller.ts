import type { NextFunction, Request, Response } from 'express';
import { envoltorioAsync } from '../../shared/middlewares/async-handler';
import { loggearAuditoria } from '../../shared/utils/auditoria';
import type {
  ActualizarUsuarioInput,
  CrearUsuarioInput,
  ObtenerUsuarioPorIdInput,
} from './users.schema';
import * as servicioUsuarios from './users.service';

export const listarUsuarios = envoltorioAsync(async (_req: Request, res: Response) => {
  const usuarios = await servicioUsuarios.listarUsuarios();
  res.status(200).json({ datos: usuarios });
});

export const obtenerUsuarioPorId = envoltorioAsync(async (req: Request, res: Response) => {
  const usuario = await servicioUsuarios.obtenerUsuarioPorId(
    req.params as unknown as ObtenerUsuarioPorIdInput,
  );
  res.status(200).json({ datos: usuario });
});

export const crearUsuario = envoltorioAsync(async (req: Request, res: Response) => {
  const usuario = await servicioUsuarios.crearUsuario(req.body as CrearUsuarioInput);
  loggearAuditoria(req, 'CREAR_USUARIO', usuario.id, req.body as Record<string, unknown>);
  res.status(201).json({ datos: usuario });
});

export const actualizarUsuario = envoltorioAsync(async (req: Request, res: Response) => {
  const usuario = await servicioUsuarios.actualizarUsuario(
    req.params as unknown as ObtenerUsuarioPorIdInput,
    req.body as ActualizarUsuarioInput,
  );
  loggearAuditoria(
    req,
    'ACTUALIZAR_USUARIO',
    req.params.id as string,
    req.body as Record<string, unknown>,
  );
  res.status(200).json({ datos: usuario });
});

export const eliminarUsuario = envoltorioAsync(async (req: Request, res: Response) => {
  const usuario = await servicioUsuarios.eliminarUsuario(
    req.params as unknown as ObtenerUsuarioPorIdInput,
  );
  loggearAuditoria(req, 'ELIMINAR_USUARIO', req.params.id as string);
  res.status(200).json({ datos: usuario });
});

// Reservado para manejo explícito si se necesita tipar `next` en el futuro.
export type { NextFunction };
