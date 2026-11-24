import type { Context } from 'hono';
import type { AppEnvironment } from './types';

export const SESSION_COOKIE = 'red_admin_session';
export const DEMO_ADMIN_PASSWORD = 'red-admin-demo';
const FALLBACK_SESSION_SECRET = 'preview-session-secret-change-before-deploy';
const SESSION_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sign(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function constantTimeEqual(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;
  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function cookieFromRequest(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload = `${Date.now() + SESSION_SECONDS * 1000}`;
  const payloadPart = toBase64Url(encoder.encode(payload));
  const signature = toBase64Url(await sign(payloadPart, secret));
  return `${payloadPart}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [payloadPart, signaturePart, extra] = token.split('.');
  if (!payloadPart || !signaturePart || extra) return false;
  try {
    const expected = toBase64Url(await sign(payloadPart, secret));
    if (!constantTimeEqual(expected, signaturePart)) return false;
    const expiresAt = Number(new TextDecoder().decode(fromBase64Url(payloadPart)));
    return Number.isFinite(expiresAt) && expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function sessionSecret(env: AppEnvironment['Bindings'] = {}): string {
  return env.SESSION_SECRET?.trim() || FALLBACK_SESSION_SECRET;
}

export function expectedAdminPassword(env: AppEnvironment['Bindings'] = {}): string {
  return env.ADMIN_PASSWORD?.trim() || DEMO_ADMIN_PASSWORD;
}

export function isPreviewMode(env: AppEnvironment['Bindings'] = {}): boolean {
  // This flag controls whether the default demo password is disclosed on the login screen.
  // Memory storage is reported separately, so a configured production password is never exposed.
  return !env.ADMIN_PASSWORD?.trim();
}

export async function isAuthenticated(c: Context<AppEnvironment>): Promise<boolean> {
  const token = cookieFromRequest(c.req.header('Cookie'), SESSION_COOKIE);
  return verifySessionToken(token, sessionSecret(c.env));
}

function requestIsSecure(c: Context<AppEnvironment>): boolean {
  return new URL(c.req.url).protocol === 'https:' || c.req.header('X-Forwarded-Proto')?.split(',')[0].trim() === 'https';
}

export async function setSessionCookie(c: Context<AppEnvironment>): Promise<void> {
  const token = await createSessionToken(sessionSecret(c.env));
  const secure = requestIsSecure(c) ? '; Secure' : '';
  c.header('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}${secure}`);
}

export function clearSessionCookie(c: Context<AppEnvironment>): void {
  const secure = requestIsSecure(c) ? '; Secure' : '';
  c.header('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}
