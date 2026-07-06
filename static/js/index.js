(function () {
  "use strict";

  function showPage(pageName = "lobby") {
  const lobbyPage = document.getElementById("lobbyPage");
  const caseFilesPage = document.getElementById("caseFilesPage");
  const settingsPage = document.getElementById("settingsPage");
  const pricingPage = document.getElementById("pricingPage");
  const authPage = document.querySelector(".auth-page");
  const header = document.querySelector(".header");

  if (pageName === "auth") {
    if (authPage) {
      authPage.style.display = "grid";
    }
  } else {
    if (authPage) {
      authPage.style.display = "none";
    }
  }

  if (pageName === "auth") {
    if (header) {
      header.style.display = "none";
    }
  } else {
    if (header) {
      header.style.display = "flex";
    }
  }

  if (pageName === "lobby" || !pageName) {
    if (lobbyPage) {
      lobbyPage.style.display = "block";
    }
  } else {
    if (lobbyPage) {
      lobbyPage.style.display = "none";
    }
  }

  if (pageName === "caseFiles") {
    if (caseFilesPage) {
      caseFilesPage.style.display = "block";
    }
  } else {
    if (caseFilesPage) {
      caseFilesPage.style.display = "none";
    }
  }

  if (pageName === "settings") {
    if (settingsPage) {
      settingsPage.style.display = "block";
    }
  } else {
    if (settingsPage) {
      settingsPage.style.display = "none";
    }
  }

  if (pageName === "pricing") {
    if (pricingPage) {
      pricingPage.style.display = "block";
    }
  } else {
    if (pricingPage) {
      pricingPage.style.display = "none";
    }
  }
}

  window.addEventListener("DOMContentLoaded", function () {
    const googleButton = document.querySelector(".oauth-button");

    if (googleButton) {
      googleButton.addEventListener("click", function () {
        apiService.redirectToGoogle();
      });
    }

    const lobby = document.getElementById("lobby");
    const caseFiles = document.getElementById("caseFiles");
    const settings = document.getElementById("settings");
    const pricing = document.getElementById("pricing");

    
    if (lobby) {
      lobby.addEventListener("click", function () {
        showPage("lobby");
      });
    }

    if (caseFiles) {
      caseFiles.addEventListener("click", function () {
        showPage("caseFiles");
      });
    }

    if (settings) {
      settings.addEventListener("click", function () {
        showPage("settings");
      });
    }

    if (pricing) {
      pricing.addEventListener("click", function () {
        showPage("pricing");
      });
    }

    apiService.getCurrentUser().then(function (data) {
      if (!data.user) {
        apiService.clearStoredCurrentUser();
        showPage("auth");
        return;
      }

      apiService.storeCurrentUser(data.user);

      const usernameText = document.querySelector(".username p");

      if (usernameText) {
        usernameText.textContent = data.user.email;
      }

      showPage("lobby");
    });


    const signOutButton = document.querySelector(".sign-out");

    if (signOutButton) {
      signOutButton.addEventListener("click", function () {
        apiService.logout().then(function () {
          apiService.clearStoredCurrentUser();
          showPage("auth");
        });
      });
    }
    
  });
})();