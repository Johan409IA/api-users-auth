import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma, limpiarBaseDeDatos, crearUsuarioDePrueba } from '../helpers/db';
import { generarToken, crearAdminYObtenerToken, registrarYObtenerToken } from '../helpers/auth';

let tokenAdmin: string;
let adminId: string;
let tokenUser: string;
let userId: string;

beforeEach(async () => {
  await limpiarBaseDeDatos();
  const admin = await crearAdminYObtenerToken(app);
  tokenAdmin = admin.token;
  adminId = admin.usuario.id;

  const user = await registrarYObtenerToken(app, {
    email: 'usuario-normal@example.com',
  });
  tokenUser = user.token;
  userId = user.usuario.id;
});

function expectSinPassword(body: Record<string, unknown>) {
  const datos = body.datos;
  if (Array.isArray(datos)) {
    for (const d of datos) {
      expect(d).not.toHaveProperty('password');
    }
  } else if (datos) {
    expect(datos).not.toHaveProperty('password');
  }
}

// ─── LISTAR ──────────────────────────────────────────────────────────

describe('GET /api/users', () => {
  it('ADMIN puede listar usuarios (sin password)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);

    expect(Array.isArray(res.body.datos)).toBe(true);
    expect(res.body.datos.length).toBeGreaterThanOrEqual(1);
    expectSinPassword(res.body);
  });

  it('sin token devuelve 401', async () => {
    const res = await request(app).get('/api/users').expect(401);
    expect(res.body.error.mensaje).toBe('Token de autenticación no proporcionado');
  });

  it('USER devuelve 403', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokenUser}`)
      .expect(403);

    expect(res.body.error.mensaje).toBe('No tienes permiso para acceder a este recurso');
  });

  it('lista vacía', async () => {
    // Limpiar todo (sin recrear) pero usar token válido con rol ADMIN.
    await prisma.user.deleteMany();
    const tokenVacio = generarToken({ sub: adminId, rol: 'ADMIN' });

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokenVacio}`)
      .expect(200);

    expect(res.body.datos).toEqual([]);
  });
});

// ─── OBTENER POR ID ──────────────────────────────────────────────────

describe('GET /api/users/:id', () => {
  it('ADMIN obtiene usuario existente sin password', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);

    expect(res.body.datos.id).toBe(userId);
    expectSinPassword(res.body);
  });

  it('UUID inválido devuelve 400', async () => {
    const res = await request(app)
      .get('/api/users/no-es-uuid')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('UUID válido pero inexistente devuelve 404', async () => {
    const res = await request(app)
      .get('/api/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(404);

    expect(res.body.error.mensaje).toBe('Usuario no encontrado');
  });

  it('sin token devuelve 401', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .expect(401);
    expect(res.body.error.mensaje).toBeDefined();
  });

  it('USER devuelve 403', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenUser}`)
      .expect(403);
    expect(res.body.error.mensaje).toBe('No tienes permiso para acceder a este recurso');
  });
});

// ─── CREAR ──────────────────────────────────────────────────────────

describe('POST /api/users', () => {
  const datosBase = {
    name: 'Nuevo Usuario',
    email: 'nuevo@example.com',
    password: 'Abc1234!',
  };

  it('ADMIN crea usuario con rol ADMIN', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...datosBase, email: 'admin-creado@example.com', rol: 'ADMIN' })
      .expect(201);

    expect(res.body.datos.rol).toBe('ADMIN');
    expectSinPassword(res.body);
  });

  it('ADMIN crea usuario con rol USER', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...datosBase, email: 'user-creado@example.com', rol: 'USER' })
      .expect(201);

    expect(res.body.datos.rol).toBe('USER');
    expectSinPassword(res.body);
  });

  it('rol por defecto es USER', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...datosBase, email: 'default@example.com' })
      .expect(201);

    expect(res.body.datos.rol).toBe('USER');
  });

  it('email duplicado devuelve 409', async () => {
    await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...datosBase, email: 'duplicado@example.com' })
      .expect(201);

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...datosBase, email: 'duplicado@example.com' })
      .expect(409);

    expect(res.body.error.mensaje).toBe('El email ya está registrado');
  });

  it('datos inválidos devuelve 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: 'Sin email ni password' })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('sin token devuelve 401', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(datosBase)
      .expect(401);
    expect(res.body.error.mensaje).toBeDefined();
  });

  it('USER devuelve 403', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send(datosBase)
      .expect(403);
    expect(res.body.error.mensaje).toBe('No tienes permiso para acceder a este recurso');
  });
});

// ─── ACTUALIZAR ──────────────────────────────────────────────────────

describe('PATCH /api/users/:id', () => {
  it('actualiza nombre', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: 'Nombre Actualizado' })
      .expect(200);

    expect(res.body.datos.name).toBe('Nombre Actualizado');
    expect(res.body.datos.email).toBe('usuario-normal@example.com');
    expectSinPassword(res.body);
  });

  it('actualiza email', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ email: 'nuevo-email@example.com' })
      .expect(200);

    expect(res.body.datos.email).toBe('nuevo-email@example.com');
  });

  it('actualiza rol', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ rol: 'ADMIN' })
      .expect(200);

    expect(res.body.datos.rol).toBe('ADMIN');
  });

  it('actualiza isActive', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ isActive: false })
      .expect(200);

    expect(res.body.datos.isActive).toBe(false);
  });

  it('body vacío devuelve 400', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({})
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });

  it('email duplicado de otro usuario devuelve 409', async () => {
    await crearUsuarioDePrueba({
      email: 'otro@example.com',
      password: 'Abc1234!',
    });

    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ email: 'otro@example.com' })
      .expect(409);

    expect(res.body.error.mensaje).toBe('El email ya está registrado');
  });

  it('usuario no encontrado devuelve 404', async () => {
    const res = await request(app)
      .patch('/api/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: 'No Existe' })
      .expect(404);

    expect(res.body.error.mensaje).toBe('Usuario no encontrado');
  });

  it('UUID inválido devuelve 400', async () => {
    const res = await request(app)
      .patch('/api/users/no-uuid')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: 'Test' })
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });
});

// ─── ELIMINAR ────────────────────────────────────────────────────────

describe('DELETE /api/users/:id', () => {
  it('elimina usuario existente y devuelve datos sin password', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);

    expect(res.body.datos.id).toBe(userId);
    expectSinPassword(res.body);

    const usuarioBorrado = await prisma.user.findUnique({ where: { id: userId } });
    expect(usuarioBorrado).toBeNull();
  });

  it('usuario no encontrado devuelve 404', async () => {
    const res = await request(app)
      .delete('/api/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(404);

    expect(res.body.error.mensaje).toBe('Usuario no encontrado');
  });

  it('UUID inválido devuelve 400', async () => {
    const res = await request(app)
      .delete('/api/users/no-uuid')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(400);

    expect(res.body.error.mensaje).toBe('Datos de entrada inválidos');
  });
});
