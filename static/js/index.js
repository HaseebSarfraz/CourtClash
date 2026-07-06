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
