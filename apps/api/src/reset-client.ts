import { createAuthClient } from "@neondatabase/auth";
import { authError, cleanOtp, validateOtp, validatePasswords, waitForAuth } from "./auth-ui.js";

const auth = createAuthClient(document.documentElement.dataset.authUrl!);
const form = document.querySelector<HTMLFormElement>("#reset-form")!;
const email = document.querySelector<HTMLInputElement>("#email")!;
const otp = document.querySelector<HTMLInputElement>("#otp")!;
const password = document.querySelector<HTMLInputElement>("#password")!;
const confirmation = document.querySelector<HTMLInputElement>("#confirmation")!;
const fields = document.querySelector<HTMLElement>("#reset-fields")!;
const submit = document.querySelector<HTMLButtonElement>("#submit")!;
const resend = document.querySelector<HTMLButtonElement>("#resend")!;
const message = document.querySelector<HTMLElement>("#message")!;
let sent = false;
let busy = false;
function show(text: string, error = false) {
 message.textContent = text; message.setAttribute("role", error ? "alert" : "status"); message.dataset.kind = error ? "error" : "success";
}
function pending(value: boolean) {
 busy = value; submit.disabled = resend.disabled = value; form.setAttribute("aria-busy", String(value));
 submit.textContent = value ? "Traitement en cours…" : sent ? "Définir mon mot de passe" : "Recevoir mon code";
}
let lastSent = 0;

if (new URL(location.href).searchParams.get("review") === "1")
  email.value = "soufiane936s+review@gmail.com";

async function sendCode() {
  if (Date.now() - lastSent < 60_000)
    throw new Error("Patientez une minute avant de redemander un code.");
  const result = await waitForAuth(auth.emailOtp.requestPasswordReset({ email: email.value.trim() }));
  if (result.error) throw new Error(authError(result.error));
  lastSent = Date.now();
  sent = true;
  email.readOnly = true;
  fields.hidden = false;
  otp.required = password.required = confirmation.required = true;
  resend.hidden = false;
  submit.textContent = "Définir mon mot de passe";
  message.textContent = "Si ce compte existe, un code a été envoyé. Consultez votre messagerie et les courriers indésirables. Utilisez le dernier code reçu.";
  otp.focus();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;
  pending(true);
  message.textContent = "";
  try {
    if (!email.validity.valid || !email.value.trim()) throw new Error("Saisissez une adresse e-mail valide.");
    if (!sent) await sendCode();
    else {
      validateOtp(otp.value);
      validatePasswords(password.value, confirmation.value);
      const result = await waitForAuth(auth.emailOtp.resetPassword({
        email: email.value.trim(), otp: cleanOtp(otp.value), password: password.value,
      }));
      if (result.error) throw new Error(authError(result.error));
      if (!result.data?.success) throw new Error("L’enregistrement n’a pas été confirmé. Réessayez.");
      form.hidden = true;
      resend.hidden = true;
      otp.value = password.value = confirmation.value = "";
      message.textContent = "Votre mot de passe est défini. Dans l’application, choisissez « Utiliser un mot de passe » et connectez-vous avec cette adresse e-mail. Vous pouvez fermer cette page.";
      message.focus();
    }
  } catch (error) {
    show(error instanceof TypeError ? "Connexion au service impossible. Vérifiez votre accès Internet." : error instanceof Error ? error.message : "Service indisponible. Réessayez.", true);
  } finally {
    pending(false);
  }
});

resend.addEventListener("click", async () => {
  if (busy) return;
  pending(true);
  try { await sendCode(); }
  catch (error) { show(error instanceof Error ? error.message : "Envoi impossible.", true); }
  finally { pending(false); }
});
