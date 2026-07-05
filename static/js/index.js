(function () {
  "use strict";

  window.addEventListener("DOMContentLoaded", function () {
    const googleButton = document.querySelector(".oauth-button");

    if (googleButton) {
      googleButton.addEventListener("click", function () {
        apiService.redirectToGoogle();
      });
    }

    apiService.getCurrentUser().then(function (data) {
      if (!data.user) {
        apiService.clearStoredCurrentUser();
        return;
      }

      apiService.storeCurrentUser(data.user);
      console.log("Signed in as:", data.user.displayName);
    });
  });
})();