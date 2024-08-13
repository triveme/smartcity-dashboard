import * as crypto from 'crypto';

export class EncryptionUtil {
  static encryptPassword(password: string): { iv: string; content: string } {
    if (password === null || password === undefined) return null;

    const algorithm = 'aes-256-cbc';

    const envKey = process.env.PASSWORD_ENCRYPT_KEY;
    if (envKey === null || envKey === undefined)
      throw new Error("Can't encrypt password, key is not set.");

    const key = Buffer.from(envKey, 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), content: encrypted };
  }

  static decryptPassword(hash?: object): string {
    if (hash === null || undefined) return null;
    if (typeof hash === 'string') return hash;

    const algorithm = 'aes-256-cbc';

    const envKey = process.env.PASSWORD_ENCRYPT_KEY;
    if (envKey === null || envKey === undefined)
      throw new Error("Can't encrypt password, key is not set.");
    const key = Buffer.from(envKey, 'hex');

    if (key === null)
      throw new Error("Can't decrypt password, key is not set.");
    if (hash['iv'] === null || hash['content'] === null)
      throw new Error("Can't decrypt password, data is incomplete.");
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(hash['iv'], 'hex'),
    );
    let decrypted = decipher.update(hash['content'], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
