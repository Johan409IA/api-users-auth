import { prisma as prismaApp } from '../../src/config/database';
import { hashear } from '../../src/shared/utils/hash';

export const prisma = prismaApp;

export async function limpiarBaseDeDatos(): Promise<void> {
  await prisma.user.deleteMany();
}

export async function desconectarPrisma(): Promise<void> {
  await prisma.$disconnect();
}

interface CrearUsuarioPruebaParams {
  name?: string;
  email?: string;
  password?: string;
  rol?: 'USER' | 'ADMIN';
  isActive?: boolean;
}

export async function crearUsuarioDePrueba(params: CrearUsuarioPruebaParams = {}) {
  const {
    name = 'Test User',
    email = 'test@example.com',
    password = 'Test1234!',
    rol = 'USER',
    isActive = true,
  } = params;
  const passwordHasheado = await hashear(password);
  return prisma.user.create({
    data: { name, email, password: passwordHasheado, rol, isActive },
  });
}
