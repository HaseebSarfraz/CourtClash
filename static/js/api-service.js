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

export function generateRuling(payload) {
  return fetch("/ai/ruling", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }).then((res) => res.json());
}