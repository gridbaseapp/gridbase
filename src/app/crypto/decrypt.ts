import { createDecipheriv, scryptSync } from 'crypto';
import { ALGORITHM, KEY_LENGTH } from './constants';

export function decrypt(password: string, message: string) {
  const payload = JSON.parse(Buffer.from(message, 'hex').toString());
  const salt = Buffer.from(payload.salt, 'hex');
  const key = scryptSync(password, salt, KEY_LENGTH);
  const iv = Buffer.from(payload.iv, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));

  return decipher.update(payload.ciphertext, 'hex', 'utf8') + decipher.final('utf8');
}
