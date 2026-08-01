export const ADMIN_COOKIE_NAME = "ciranda_admin_session";
const SALT = "ciranda-admin-salt-v1";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "ciranda123";
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedSessionToken() {
  return sha256Hex(`${getAdminPassword()}:${SALT}`);
}

export async function verifyAdminPassword(password: string) {
  return password === getAdminPassword();
}

export async function isValidSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const expected = await getExpectedSessionToken();
  return token === expected;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Não autorizado.");
  }
}

// Import dinâmico: src/proxy.ts (Edge) também importa este arquivo e não pode carregar next/headers.
export async function requireAdminSession() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!(await isValidSessionToken(token))) {
    throw new UnauthorizedError();
  }
}
