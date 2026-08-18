import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Gera uma senha temporária legível (sem caracteres ambíguos como 0/O, 1/l/I). */
export function generateTemporaryPassword(length = 10): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += TEMP_PASSWORD_CHARS[Math.floor(Math.random() * TEMP_PASSWORD_CHARS.length)];
  }
  return result;
}
