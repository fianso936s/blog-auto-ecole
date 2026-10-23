/** Cloudflare R2 private bucket, signed by the API ONLY. Zero extra npm packages.
 *  Server configuration (never expose via EXPO_PUBLIC_): R2_ACCOUNT_ID,
 *  R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.
 *  The R2 bucket MUST remain private; do not attach a public custom domain.
 */
import { createHash, createHmac } from "node:crypto";
import { ApiError } from "./security.js";

const sha256 = (data: string) => createHash("sha256").update(data).digest("hex");
const hmac = (key: string | Buffer, data: string) =>
  createHmac("sha256", key).update(data).digest();
const esc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
export type SignedMethod = "PUT" | "GET" | "HEAD" | "DELETE";
export function storageReady() {
  return !!(process.env.AWS_ENDPOINT_URL_S3 && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) || ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"].every(k => !!process.env[k]);
}
export function storageSign(method: SignedMethod, key: string, mime?: string, expires = 300, now = new Date(), bytes?: number) {
  if (!storageReady()) throw new ApiError(503, "Publication vidéo non configurée : les vidéos locales restent sur l’iPhone.");
  if (!/^[a-z0-9-]{12,120}\.mp4$/.test(key)) throw new ApiError(400, "Clé vidéo invalide.");
  const neon = !!process.env.AWS_ENDPOINT_URL_S3;
  const account = process.env.R2_ACCOUNT_ID!;
  const access = (neon ? process.env.AWS_ACCESS_KEY_ID : process.env.R2_ACCESS_KEY_ID)!;
  const secret = (neon ? process.env.AWS_SECRET_ACCESS_KEY : process.env.R2_SECRET_ACCESS_KEY)!;
  const bucket = neon ? "repere-videos" : process.env.R2_BUCKET!;
  if (!/^[a-zA-Z0-9-]+$/.test(bucket) || (!neon && !/^[a-f0-9]{32}$/.test(account)))
    throw new ApiError(503, "Configuration du stockage incorrecte.");
  if (expires < 1 || expires > 3600) throw new ApiError(400, "Expiration invalide.");
  const endpoint = new URL(neon ? process.env.AWS_ENDPOINT_URL_S3! : `https://${account}.r2.cloudflarestorage.com`);
  if (endpoint.protocol !== "https:" || endpoint.pathname !== "/" || endpoint.search || endpoint.username || endpoint.password)
    throw new ApiError(503, "Adresse de stockage incorrecte.");
  const host = endpoint.host;
  const region = neon ? process.env.AWS_REGION || "eu-central-1" : "auto";
  const date = now.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const day = date.slice(0, 8);
  const scope = `${day}/${region}/s3/aws4_request`;
  if (method === "PUT" && (!mime || !bytes || !Number.isSafeInteger(bytes)))
    throw new ApiError(400, "Type et taille de fichier requis pour une signature d'envoi.");
  // Signed Content-Length limits a signed upload to the byte count explicitly reserved.
  const headers = mime && method === "PUT" ? { "Content-Type": mime, "Content-Length": String(bytes) } : {};
  const signedHeaders = mime && method === "PUT" ? "content-length;content-type;host" : "host";
  const canonicalHeaders = mime && method === "PUT"
    ? `content-length:${bytes}\ncontent-type:${mime}\nhost:${host}\n`
    : `host:${host}\n`;
  const path = `/${esc(bucket)}/${esc(key)}`;
  const query = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${access}/${scope}`,
    "X-Amz-Date": date,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": signedHeaders,
  };
  const canonicalQuery = Object.entries(query).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([k, v]) => `${esc(k)}=${esc(v)}`).join("&");
  const canonicalRequest = [method, path, canonicalQuery, canonicalHeaders, signedHeaders, "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", date, scope, sha256(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secret}`, day), region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  return { url: `https://${host}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`, headers, expiresIn: expires };
}
export async function storageHead(key: string) {
  const signed = storageSign("HEAD", key, undefined, 60);
  const response = await fetch(signed.url, { method: "HEAD" });
  if (!response.ok) throw new ApiError(409, "Téléversement non retrouvé ou non terminé.");
  return { bytes: Number(response.headers.get("content-length") || "0"), mime: response.headers.get("content-type") || "" };
}
export async function storageDelete(key: string) {
  const signed = storageSign("DELETE", key, undefined, 60);
  const response = await fetch(signed.url, { method: "DELETE" });
  if (!response.ok && response.status !== 404) throw new ApiError(503, "Impossible de supprimer le fichier distant.");
}
