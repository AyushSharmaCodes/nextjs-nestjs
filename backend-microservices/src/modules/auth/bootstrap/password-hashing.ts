import { randomBytes, scrypt } from 'node:crypto';
import * as bcryptjs from 'bcryptjs';

const SCRYPT_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
};

export function isBetterAuthPasswordHash(hash: string): boolean {
  const [salt, key] = hash.split(':');
  return Boolean(
    salt &&
    key &&
    /^[0-9a-f]+$/i.test(salt) &&
    /^[0-9a-f]+$/i.test(key),
  );
}

export function isBcryptPasswordHash(hash: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(hash);
}

export async function hashAuthPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = await generateKey(password, salt);
  return `${salt}:${key.toString('hex')}`;
}

export async function verifyAuthPassword({
  hash,
  password,
}: {
  hash: string;
  password: string;
}): Promise<boolean> {
  if (isBcryptPasswordHash(hash)) {
    return bcryptjs.compare(password, hash);
  }

  if (!isBetterAuthPasswordHash(hash)) {
    return false;
  }

  const [salt, key] = hash.split(':') as [string, string];
  const targetKey = await generateKey(password, salt);
  return targetKey.toString('hex') === key;
}

async function generateKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      SCRYPT_CONFIG.dkLen,
      {
        N: SCRYPT_CONFIG.N,
        r: SCRYPT_CONFIG.r,
        p: SCRYPT_CONFIG.p,
        maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
      },
      (err, key) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(key);
      },
    );
  });
}
