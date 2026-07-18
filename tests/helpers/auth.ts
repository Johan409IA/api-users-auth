import jwt from 'jsonwebtoken';
import type { Application } from 'express';
import request from 'supertest';
import { prisma } from './db';

const SECRETO = process.env.JWT_SECRET!;

export function generarToken(payload: { sub: string; rol: 'USER' | 'ADMIN' }): string {
  return jwt.sign(payload, SECRETO, { expiresIn: '1h' } as jwt.SignOptions);
}

interface AuthResult {
  token: string;
  usuario: { id: string; name: string; email: string; rol: string };
}

export async function registrarYObtenerToken(
  app: Application,
  datos: { name?: string; email?: string; password?: string } = {},
): Promise<AuthResult> {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: datos.name ?? 'Test User',
      email: datos.email ?? `test-${Date.now()}@example.com`,
      password: datos.password ?? 'Test1234!',
    })
    .expect(201);

  return res.body.datos as AuthResult;
}

export async function crearAdminYObtenerToken(app: Application): Promise<AuthResult> {
  const res = await registrarYObtenerToken(app);
  await prisma.user.update({
    where: { id: res.usuario.id },
    data: { rol: 'ADMIN' },
  });
  const token = generarToken({ sub: res.usuario.id, rol: 'ADMIN' });
  return { token, usuario: { ...res.usuario, rol: 'ADMIN' } };
}
