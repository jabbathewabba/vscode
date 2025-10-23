import * as SecureStore from 'expo-secure-store';

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS, access);
  await SecureStore.setItemAsync(REFRESH, refresh);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH);
}

export async function refreshTokens(apiUrl: string) {
  const refresh = await getRefreshToken();
  if (!refresh) return null;
  const userId = ''; // client should keep userId in secure store or include in refresh payload
  const res = await fetch(apiUrl + '/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, refreshToken: refresh })
  });
  if (!res.ok) return null;
  const json = await res.json();
  await saveTokens(json.accessToken, json.refreshToken);
  return json;
}
