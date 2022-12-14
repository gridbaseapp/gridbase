import { randomBytes } from 'crypto';
import { getPassword, setPassword } from 'keytar';

const SECRET_LENGTH = 64;
const SERVICE_NAME = 'GridBase';
const ACCOUNT_NAME = 'GridBase';

export async function getPasswordFromVault() {
  let password = await getPassword(SERVICE_NAME, ACCOUNT_NAME);

  if (!password) {
    password = randomBytes(SECRET_LENGTH).toString('hex');
    await setPassword(SERVICE_NAME, ACCOUNT_NAME, password);
  }

  return password;
}
