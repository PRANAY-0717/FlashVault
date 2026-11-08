import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

function getKey(): string {
  const key =
    process.env.MY_SECRET_KEY ||
    "85f08760f744a4bdd9be63db21196b179b4efaaa68b86a62e1f67d72d21d6ba9";
  return key;
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getKey(), "hex"), iv);
  let encrypted = cipher.update(text);
  const padded = cipher.final();
  encrypted = Buffer.concat([encrypted, padded]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getKey(), "hex"), iv);
  let decrypted = decipher.update(encryptedText);
  const padded = decipher.final();
  decrypted = Buffer.concat([decrypted, padded]);
  return decrypted.toString();
}
