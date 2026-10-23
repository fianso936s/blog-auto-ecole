type Data = Record<string, any>;
export async function api<T = Data>(path: string, method = "GET", body?: unknown): Promise<T> {
  if (/\/spots\/[^/]+\/quiz$/.test(path) && body && typeof body === "object" && "quizVersion" in body) {
    const b = body as Data;
    body = { ...b, version: b.quizVersion };
  }
  let response: Response;
  try {
    response = await fetch(path, {
      method, credentials: "same-origin", cache: "no-store",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(45000),
    });
  } catch (error) {
    throw new Error((error as Error).name === "TimeoutError"
      ? "Le serveur met trop de temps à répondre. Réessayez."
      : "Connexion interrompue. Vérifiez votre accès Internet puis réessayez.");
  }
  const data = await response.json().catch(() => ({ error: "Le serveur ne répond pas correctement. Réessayez." }));
  if (!response.ok) {
    if (response.status === 401 && path.startsWith("/v1/") && path !== "/v1/me")
      window.dispatchEvent(new Event("repere:session-expired"));
    throw Object.assign(new Error(data?.error?.message || data?.error || data?.message || "La demande a échoué."), {status: response.status, code: data?.code});
  }
  return data;
}
