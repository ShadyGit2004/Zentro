import crypto from "crypto";

export const createTranslationHash = (text: string): string => {
  return crypto.createHash("sha256").update(text.trim(), "utf8").digest("hex");
};
