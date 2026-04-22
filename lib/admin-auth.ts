import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getAdminEnv() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment");
  }

  return { email, password };
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? getAdminEnv().password;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

function createSessionValue(email: string) {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = toBase64Url(JSON.stringify({ email, exp }));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function parseSessionValue(value: string | undefined) {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (!safeEqual(signature, expected)) return null;

  try {
    const decoded = JSON.parse(fromBase64Url(payload)) as {
      email?: string;
      exp?: number;
    };

    if (!decoded.email || !decoded.exp || decoded.exp < Date.now()) {
      return null;
    }

    if (decoded.email !== getAdminEnv().email) {
      return null;
    }

    return { email: decoded.email, exp: decoded.exp };
  } catch {
    return null;
  }
}

export function validateAdminCredentials(email: string, password: string) {
  const admin = getAdminEnv();
  return email === admin.email && password === admin.password;
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;
  return parseSessionValue(cookieValue);
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}
