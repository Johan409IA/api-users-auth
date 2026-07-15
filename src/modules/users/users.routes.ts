import { Router } from 'express';
import { validar } from '../../shared/middlewares/validate-schema';
import * as controladorUsuarios from './users.controller';
import {
  actualizarUsuarioSchema,
  crearUsuarioSchema,
  obtenerUsuarioPorIdSchema,
} from './users.schema';

export const enrutadorUsuarios = Router();

enrutadorUsuarios.post('/', validar(crearUsuarioSchema, 'body'), controladorUsuarios.crearUsuario);
enrutadorUsuarios.get('/', controladorUsuarios.listarUsuarios);
enrutadorUsuarios.get(
  '/:id',
  validar(obtenerUsuarioPorIdSchema, 'params'),
  controladorUsuarios.obtenerUsuarioPorId,
);
enrutadorUsuarios.patch(
  '/:id',
  validar(obtenerUsuarioPorIdSchema, 'params'),
  validar(actualizarUsuarioSchema, 'body'),
  controladorUsuarios.actualizarUsuario,
);
enrutadorUsuarios.delete(
  '/:id',
  validar(obtenerUsuarioPorIdSchema, 'params'),
  controladorUsuarios.eliminarUsuario,
);
