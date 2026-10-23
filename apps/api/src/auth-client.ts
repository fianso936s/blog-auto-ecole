import { createAuthClient } from "@neondatabase/auth";
import { authError, cleanOtp, validateOtp, validatePasswords, waitForAuth } from "./auth-ui.js";
const authUrl = document.documentElement.dataset.authUrl;
if (!authUrl) throw new Error("Authentification non configurée");
const auth = createAuthClient(authUrl);
const form = document.querySelector<HTMLFormElement>("#auth-form")!;
const email = document.querySelector<HTMLInputElement>("#email")!;
const name = document.querySelector<HTMLInputElement>("#name")!;
const password = document.querySelector<HTMLInputElement>("#password")!;
const otp = document.querySelector<HTMLInputElement>("#otp")!;
const message = document.querySelector<HTMLElement>("#message")!;
const button = document.querySelector<HTMLButtonElement>("#submit")!;
const mode = document.querySelector<HTMLButtonElement>("#password-mode")!;
const resend = document.querySelector<HTMLButtonElement>("#resend")!;
const params = new URL(location.href).searchParams;
const request = params.get("request");
let signup = params.get("mode") === "signup", busy = false, verifying = false, lastSent = 0;
function show(text: string, error = false) {message.textContent=text;message.setAttribute("role",error?"alert":"status");message.dataset.kind=error?"error":"success";}
function pending(value: boolean) {
  busy=value;button.disabled=mode.disabled=resend.disabled=value;form.setAttribute("aria-busy",String(value));
  button.textContent=value?"Traitement en cours…":verifying?"Vérifier mon adresse":signup?"Créer mon compte":"Se connecter";
}
function display() {
  document.querySelector<HTMLElement>("#name-field")!.hidden=!signup||verifying;
  document.querySelector<HTMLElement>("#password-field")!.hidden=verifying;
  document.querySelector<HTMLElement>("#otp-field")!.hidden=!verifying;
  email.readOnly=verifying;resend.hidden=!verifying;otp.required=verifying;password.required=!verifying;
  password.autocomplete=signup?"new-password":"current-password";
  mode.textContent=verifying?"Changer de compte":signup?"J’ai déjà un compte":"Créer un compte";pending(false);
}
async function sendVerification() {
  if(Date.now()-lastSent<60_000)throw Error("Patientez une minute avant de redemander un code.");
  const r=await waitForAuth(auth.emailOtp.sendVerificationOtp({email:email.value.trim(),type:"email-verification"}));
  if(r.error)throw Error(authError(r.error));lastSent=Date.now();verifying=true;display();password.value="";
  show("Vérifiez votre adresse avec le code reçu par e-mail. Cette étape protège votre compte et n’est demandée qu’une fois.");otp.focus();
}
async function finish() {
  password.value=otp.value="";
  if(!request){form.hidden=true;mode.hidden=resend.hidden=true;show("Connexion réussie. Vos identifiants fonctionnent. Ouvrez maintenant Le Repère Permis sur votre iPhone pour retrouver votre espace.");return;}
  const result=await waitForAuth(auth.token());
  if(result.error||!result.data?.token)throw Error("Connexion incomplète. Reconnectez-vous depuis l’application.");
  const response=await fetch("/v1/auth/authorize",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${result.data.token}`},body:JSON.stringify({request}),signal:AbortSignal.timeout(45000)});
  const body=await response.json();if(!response.ok)throw Error(body.error||"Impossible d’ouvrir l’application.");
  const destination=new URL(body.redirect);if(destination.protocol!=="reperespot:"||destination.hostname!=="auth")throw Error("Lien de retour invalide.");
  const back=document.querySelector<HTMLAnchorElement>("#return")!;back.href=destination.href;back.hidden=false;show("Connexion réussie. Retournez dans l’application.");location.href=destination.href;
}
form.addEventListener("submit",async event=>{
  event.preventDefault();if(busy)return;pending(true);show("");
  try{
    if(!email.value.trim()||!email.validity.valid)throw Error("Saisissez une adresse e-mail valide.");
    if(verifying){validateOtp(otp.value);const r=await waitForAuth(auth.emailOtp.verifyEmail({email:email.value.trim(),otp:cleanOtp(otp.value)}));if(r.error)throw Error(authError(r.error));await finish();return;}
    if(!password.value)throw Error("Saisissez votre mot de passe.");if(signup)validatePasswords(password.value,password.value);
    const r=await waitForAuth(signup?auth.signUp.email({email:email.value.trim(),password:password.value,name:name.value.trim()||"Élève"}):auth.signIn.email({email:email.value.trim(),password:password.value}));
    if(r.error){if(r.error.code==="EMAIL_NOT_VERIFIED"){await sendVerification();return;}throw Error(authError(r.error));}
    if(!r.data?.user)throw Error("La connexion n’a pas été confirmée.");
    if(r.data.user.emailVerified!==true){await sendVerification();return;}
    await finish();
  }catch(e){show(e instanceof TypeError?"Connexion au service impossible. Vérifiez votre accès Internet.":e instanceof Error?e.message:"Connexion indisponible.",true);}finally{pending(false);}
});
mode.addEventListener("click",()=>{if(busy)return;if(verifying){verifying=false;signup=false;}else signup=!signup;password.value=otp.value="";show("");display();});
resend.addEventListener("click",async()=>{if(busy)return;pending(true);try{await sendVerification();}catch(e){show(e instanceof Error?e.message:"Envoi impossible.",true);}finally{pending(false);}});
display();
