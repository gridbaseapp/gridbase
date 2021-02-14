import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { getPassword, setPassword } from 'keytar';

const SECRET_LENGTH = 64;
const SERVICE_NAME = 'dbadmin';
const ACCOUNT_NAME = 'dbadmin';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

export async function getPasswordFromKeyStore() {
  let secret = await getPassword(SERVICE_NAME, ACCOUNT_NAME);

  if (!secret) {
    secret = randomBytes(SECRET_LENGTH).toString('hex');
    await setPassword(SERVICE_NAME, ACCOUNT_NAME, secret);
  }

  return secret;
}

export function encrypt(password, message) {
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

export function decrypt(password, message) {
  const payload = JSON.parse(Buffer.from(message, 'hex').toString());
  const salt = Buffer.from(payload.salt, 'hex');
  const key = scryptSync(password, salt, KEY_LENGTH);
  const iv = Buffer.from(payload.iv, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));

  return decipher.update(payload.ciphertext, 'hex', 'utf8') + decipher.final('utf8');
}
