export async function createCheckoutSession(apiUrl: string, token: string, items: any[], promo?: string) {
  const res = await fetch(apiUrl + '/checkout/session', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ items, promo }) });
  return res.json();
}
