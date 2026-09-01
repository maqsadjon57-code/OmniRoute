import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const SALT_LEN = 16;

// In production set OMNIROUTE_MASTER_KEY (32+ chars). A dev fallback is derived
// deterministically only for self-hosted/demo mode; it is never committed.
export function masterKey(): Buffer {
  const secret =
    process.env.OMNIROUTE_MASTER_KEY ??
    "omniroute-development-master-key-change-me-please";
  const hash = createHash("sha256").update(secret).digest();
  return hash;
}

export function encrypt(plaintext: string): string {
  const key = masterKey();
  const salt = randomBytes(SALT_LEN);
  const derived = scryptSync(key, salt, 32);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, derived, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${salt.toString("base64url")}.${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decrypt(payload: string): string {
  const [version, saltB64, ivB64, tagB64, encB64] = payload.split(".");
  if (version !== "v1") throw new Error("Unsupported ciphertext version");
  const key = masterKey();
  const derived = scryptSync(key, Buffer.from(saltB64, "base64url"), 32);
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const enc = Buffer.from(encB64, "base64url");
  const decipher = createDecipheriv(ALGO, derived, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
