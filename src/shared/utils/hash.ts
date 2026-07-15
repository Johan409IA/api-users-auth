import bcrypt from 'bcrypt';

const RONDAS = 10;

export async function hashear(textoPlano: string): Promise<string> {
  return bcrypt.hash(textoPlano, RONDAS);
}

export async function comparar(textoPlano: string, hash: string): Promise<boolean> {
  return bcrypt.compare(textoPlano, hash);
}
