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

export function getCaseHistory(offset, limit) {
  const url = "/api/history?offset=" + offset + "&limit=" + limit;

  return fetch(url, {
    method: "GET",
    credentials: "include",
  }).then(function (response) {
    return response.json();
  });
}

export function createCheckoutSession(plan) {
  return fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
    credentials: "include",
  }).then((res) => res.json());
}

