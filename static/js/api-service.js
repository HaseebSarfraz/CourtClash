let apiService = (function () {
  let module = {};

  module.redirectToGoogle = function () {
    window.location.href = "/auth/google";
  };

  module.logout = function () {
    return fetch("/auth/logout", {
      method: "POST",
    }).then((res) => res.json());
  };

  module.getCurrentUser = function () {
    return fetch("/auth/me", {
      method: "GET",
    }).then((res) => res.json());
  };

  module.storeCurrentUser = function (user) {
    localStorage.setItem("courtclashUser", JSON.stringify(user));
  };

  module.getStoredCurrentUser = function () {
    const storedUser = localStorage.getItem("courtclashUser");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  };

  module.clearStoredCurrentUser = function () {
    localStorage.removeItem("courtclashUser");
  };

  return module;
})();