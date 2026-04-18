import { WHOOP_AUTH_URL, WHOOP_REDIRECT_PARAM, WHOOP_SCOPES, WHOOP_TOKEN_URL } from '@/constants/config';
import type { WhoopTokens } from '@/types';

function base64URLEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = base64URLEncode(array.buffer);
  const challenge = base64URLEncode(await sha256(verifier));
  return { verifier, challenge };
}

export async function initiateWhoopOAuth(clientId: string): Promise<void> {
  const { verifier, challenge } = await generatePKCE();
  sessionStorage.setItem('whoop_pkce_verifier', verifier);

  const redirectUri = `${window.location.origin}/?${WHOOP_REDIRECT_PARAM}=1`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: WHOOP_SCOPES,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${WHOOP_AUTH_URL}?${params.toString()}`;
}

export async function exchangeWhoopCode(
  code: string,
  clientId: string
): Promise<WhoopTokens> {
  const verifier = sessionStorage.getItem('whoop_pkce_verifier');
  if (!verifier) throw new Error('PKCE verifier not found');

  const redirectUri = `${window.location.origin}/?${WHOOP_REDIRECT_PARAM}=1`;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Token exchange failed');

  const data = await res.json();
  sessionStorage.removeItem('whoop_pkce_verifier');

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshWhoopToken(
  refreshToken: string,
  clientId: string
): Promise<WhoopTokens> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error('Token refresh failed');

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
