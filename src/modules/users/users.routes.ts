import { Router } from 'express';
import { autenticar, requiereRol } from '../../shared/middlewares/auth.middleware.js';
import { validar } from '../../shared/middlewares/validate-schema.js';
import * as controladorUsuarios from './users.controller.js';
import {
  actualizarUsuarioSchema,
  crearUsuarioSchema,
  obtenerUsuarioPorIdSchema,
} from './users.schema.js';

export const enrutadorUsuarios = Router();

// Todo el módulo de usuarios queda restringido a ADMIN.
enrutadorUsuarios.use(autenticar, requiereRol('ADMIN'));

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
