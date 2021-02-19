import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

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

export function decrypt(password: string, message: string) {
  const payload = JSON.parse(Buffer.from(message, 'hex').toString());
  const salt = Buffer.from(payload.salt, 'hex');
  const key = scryptSync(password, salt, KEY_LENGTH);
  const iv = Buffer.from(payload.iv, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));

  return decipher.update(payload.ciphertext, 'hex', 'utf8') + decipher.final('utf8');
}
