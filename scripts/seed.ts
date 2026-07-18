import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcrypt';

async function seed() {
  const urlBaseDeDatos = process.env.DATABASE_URL;
  if (!urlBaseDeDatos) {
    console.error('DATABASE_URL no está definida');
    process.exit(1);
  }

  const adaptadorPg = new PrismaPg({ connectionString: urlBaseDeDatos });
  const prisma = new PrismaClient({ adapter: adaptadorPg });

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Conexión a la base de datos exitosa\n');

    const emailAdmin = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const passwordAdmin = process.env.SEED_ADMIN_PASSWORD || 'Admin1234!';
    const nombreAdmin = process.env.SEED_ADMIN_NAME || 'Administrador';

    const existente = await prisma.user.findUnique({ where: { email: emailAdmin } });

    if (existente) {
      console.log(`El usuario ${emailAdmin} ya existe. ID: ${existente.id}`);

      if (existente.rol !== 'ADMIN') {
        await prisma.user.update({
          where: { email: emailAdmin },
          data: { rol: 'ADMIN' },
        });
        console.log(`Rol actualizado a ADMIN para ${emailAdmin}`);
      }

      return;
    }

    const passwordHasheado = await bcrypt.hash(passwordAdmin, 10);

    const admin = await prisma.user.create({
      data: {
        name: nombreAdmin,
        email: emailAdmin,
        password: passwordHasheado,
        rol: 'ADMIN',
        isActive: true,
      },
    });

    console.log('Admin creado exitosamente:');
    console.log(`  ID:       ${admin.id}`);
    console.log(`  Email:    ${emailAdmin}`);
    console.log(`  Password: ${passwordAdmin}`);
    console.log(`  Rol:      ${admin.rol}\n`);
    console.log('Guarda estas credenciales en un lugar seguro.');
  } catch (error) {
    console.error('Error al crear admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void seed();
