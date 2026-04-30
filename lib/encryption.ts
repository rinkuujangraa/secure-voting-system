import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_IV = process.env.ENCRYPTION_IV;

function getCryptoConfig() {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is required');
  }
  if (!ENCRYPTION_IV) {
    throw new Error('ENCRYPTION_IV is required');
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
  const iv = Buffer.from(ENCRYPTION_IV, 'utf8');

  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
  }
  if (iv.length !== 16) {
    throw new Error('ENCRYPTION_IV must be exactly 16 characters');
  }

  return { key, iv };
}

export function encryptVote(candidateId: string): string {
  try {
    const { key, iv } = getCryptoConfig();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(candidateId, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch {
    throw new Error('Failed to encrypt vote');
  }
}

export function decryptVote(encryptedVote: string): string {
  try {
    const { key, iv } = getCryptoConfig();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedVote, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    throw new Error('Failed to decrypt vote');
  }
}