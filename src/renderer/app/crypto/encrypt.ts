import { createCipheriv, randomBytes, scryptSync } from 'crypto';
import {
  ALGORITHM,
  IV_LENGTH,
  KEY_LENGTH,
  SALT_LENGTH,
} from './constants';

export function encrypt(password: string, message: string) {
  const salt = randomBytes(SALT_LENGTH);
  const key = scryptSync(password, salt, KEY_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(message, 'utf-8', 'hex');
  ciphertext += cipher.final('hex');

  const tag = cipher.getAuthTag();

  const out = JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ciphertext,
  });

  return Buffer.from(out, 'utf8').toString('hex');
}
