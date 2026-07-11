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

export function storeCurrentUser(user) {
  localStorage.setItem("courtclashUser", JSON.stringify(user));
}

export function getStoredCurrentUser() {
  const storedUser = localStorage.getItem("courtclashUser");

  if (!storedUser) {
    return null;
  }

  return JSON.parse(storedUser);
}

export function clearStoredCurrentUser() {
  localStorage.removeItem("courtclashUser");
}