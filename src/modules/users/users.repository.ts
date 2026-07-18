import { prisma } from '../../config/database.js';
import type { UserModel } from '../../generated/prisma/models/User.js';
import type { ActualizarUsuarioInput, CrearUsuarioInput } from './users.schema.js';

// Único punto del módulo que toca prisma.user. Centralizarlo permite
// cambiar la fuente de datos (otra DB, mock, etc.) sin tocar service ni controller.

export async function obtenerTodos(): Promise<UserModel[]> {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function obtenerPorId(id: string): Promise<UserModel | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function obtenerPorEmail(email: string): Promise<UserModel | null> {
  return prisma.user.findUnique({ where: { email } });
}

// El `password` ya viene hasheado desde el service; aquí solo persistimos.
export async function crear(datos: CrearUsuarioInput & { password: string }): Promise<UserModel> {
  return prisma.user.create({ data: datos });
}

export async function actualizar(
  id: string,
  datos: Partial<ActualizarUsuarioInput & { password: string }>,
): Promise<UserModel> {
  return prisma.user.update({ where: { id }, data: datos });
}

export async function eliminar(id: string): Promise<UserModel> {
  return prisma.user.delete({ where: { id } });
}
