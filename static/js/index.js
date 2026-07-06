const openCaseButton = document.querySelector("#open-case-button");
const joinCaseButton = document.querySelector("#join-case-button");
const openCasePopup = document.querySelector("#open-case-popup");
const joinCasePopup = document.querySelector("#join-case-popup");

function showPopup(popup) {
  popup.classList.remove("hidden");
}

function hidePopup(popup) {
  popup.classList.add("hidden");
}

openCaseButton.addEventListener("click", () => {
  showPopup(openCasePopup);
});

joinCaseButton.addEventListener("click", () => {
  showPopup(joinCasePopup);
});

document.querySelectorAll(".popup-bg").forEach((popup) => {
  popup.addEventListener("click", () => {
    hidePopup(popup);
  });
});

document.querySelectorAll(".case-popup").forEach((card) => {
  card.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});

document.querySelectorAll(".close-button").forEach((button) => {
  button.addEventListener("click", () => {
    hidePopup(button.closest(".popup-bg"));
  });
});

document.querySelectorAll(".case-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});

(function () {
  "use strict";

  function showPage(pageName = "lobby") {
    const lobbyPage = document.getElementById("lobbyPage");
    const caseFilesPage = document.getElementById("caseFilesPage");
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

    if (pageName === "pricing") {
      if (pricingPage) {
        pricingPage.style.display = "flex";
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
