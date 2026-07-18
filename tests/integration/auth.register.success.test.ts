import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma, limpiarBaseDeDatos } from '../helpers/db';

beforeEach(async () => {
  await limpiarBaseDeDatos();
});

describe('POST /api/auth/register - exitoso', () => {
  it('registra un usuario y devuelve token + datos sin password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan Perez',
        email: 'juan@example.com',
        password: 'Abc1234!',
      })
      .expect(201);

    const { datos } = res.body;
    expect(datos.token).toBeTypeOf('string');
    expect(datos.token.length).toBeGreaterThan(0);
    expect(datos.usuario).toBeDefined();
    expect(datos.usuario.id).toBeTypeOf('string');
    expect(datos.usuario.name).toBe('Juan Perez');
    expect(datos.usuario.email).toBe('juan@example.com');
    expect(datos.usuario.rol).toBe('USER');
    expect(datos.usuario.isActive).toBe(true);
    expect(datos.usuario).not.toHaveProperty('password');
  });

  it('fuerza rol USER sin importar lo que intente el cliente', async () => {
    // El schema de registro es strict() y no incluye 'rol' — cualquier intento
    // de enviarlo es rechazado como propiedad extra.
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hacker',
        email: 'hacker@example.com',
        password: 'Abc1234!',
        rol: 'ADMIN',
      })
      .expect(400);
  });
});
