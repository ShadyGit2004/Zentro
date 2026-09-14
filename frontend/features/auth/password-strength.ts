export const getPasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;

  if (score <= 2) return "Weak";
  if (score <= 4) return "Medium";

  return "Strong";
};