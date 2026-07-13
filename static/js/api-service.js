export function redirectToGoogle() {
  window.location.href = "/auth/google";
}

export function logout() {
  return fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  }).then((res) => res.json());
}

export function getCurrentUser() {
  return fetch("/auth/me", {
    method: "GET",
    credentials: "include",
  }).then((res) => res.json());
}

// Stripe integration
export async function createCheckoutSession(plan) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
    credentials: 'include', // sends auth cookie/session
  });

  if (!res.ok) {
    throw new Error('Could not start checkout');
  }

  const { url } = await res.json();
  return url;
}