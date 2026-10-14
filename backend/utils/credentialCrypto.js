// backend/utils/credentialCrypto.js
// Reversible encryption for a Supervisor login's plaintext password, so the
// Admin/owner who issued the credentials can look them up again later (they
// hand these out directly — Supervisors can't self-register, see
// staffRoutes.js). This is intentionally separate from User.password, which
// stays a one-way bcrypt hash and remains the only thing login actually
// checks — this encrypted copy is never read during authentication, only
// for the admin-only staff-table display.
const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

function getKey() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set — required to derive the credential encryption key.");
  }
  // Static salt is fine here: this derives a symmetric key from a single
  // server-side secret, not a password hash meant to resist guessing.
  return crypto.scryptSync(process.env.JWT_SECRET, "clothcore-staff-credential", 32);
}

function encryptCredential(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

function decryptCredential(encoded) {
  try {
    const raw = Buffer.from(encoded, "base64");
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const ciphertext = raw.subarray(28);
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch (error) {
    // Covers missing/corrupt/pre-feature values — callers treat null as
    // "not available" rather than letting a bad value 500 the request.
    return null;
  }
}

module.exports = { encryptCredential, decryptCredential };
