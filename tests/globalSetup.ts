import 'dotenv/config';
import { execSync } from 'node:child_process';

export function setup() {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL!;

  execSync('pnpm prisma migrate deploy', {
    env: { ...process.env },
    stdio: 'inherit',
  });
}

export function teardown() {}
