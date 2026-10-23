export function authError(error: { code?: string; message?: string; status?: number } | null | undefined): string {
  const code = error?.code || "";
  if (/INVALID_EMAIL_OR_PASSWORD|INVALID_PASSWORD|USER_NOT_FOUND/.test(code)) return "Adresse e-mail ou mot de passe incorrect.";
  if (/EMAIL_NOT_VERIFIED/.test(code)) return "Cette adresse e-mail doit être vérifiée. Utilisez le code de vérification reçu par e-mail.";
  if (/EXPIRED/.test(code)) return "Ce code a expiré. Demandez un nouveau code et utilisez le dernier e-mail reçu.";
  if (/OTP/.test(code)) return "Code incorrect ou expiré. Demandez un nouveau code et copiez-le en entier.";
  if (/PASSWORD_TOO_SHORT/.test(code)) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (/PASSWORD_TOO_LONG/.test(code)) return "Le mot de passe ne doit pas dépasser 128 caractères.";
  if (/RATE|TOO_MANY/.test(code) || error?.status === 429) return "Trop de tentatives. Patientez une minute avant de réessayer.";
  if (/FAILED_TO_FETCH|NETWORK|TIMEOUT/.test(code)) return "Connexion au service interrompue. Le résultat n’est pas confirmé. Vérifiez votre réseau avant de réessayer.";
  return error?.message || "Le service n’a pas confirmé l’opération. Réessayez dans un instant.";
}
export const cleanOtp = (value: string) => value.replace(/\s/g, "");
export function validateOtp(value: string) {
  if (!/^[0-9]{6,8}$/.test(cleanOtp(value))) throw new Error("Copiez le code complet reçu par e-mail (6 à 8 chiffres).");
}
export function validatePasswords(password: string, confirmation: string) {
  if (password.length < 8 || password.length > 128) throw new Error("Le mot de passe doit contenir de 8 à 128 caractères.");
  if (password !== confirmation) throw new Error("Les deux mots de passe doivent être identiques.");
}
export async function waitForAuth<T>(promise: PromiseLike<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([Promise.resolve(promise), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Le service met trop de temps à répondre. Le résultat n’est pas confirmé ; vérifiez votre connexion avant de réessayer.")), 45000);
    })]);
  } finally { if (timer) clearTimeout(timer); }
}
