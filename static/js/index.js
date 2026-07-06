const lobbyPage = document.getElementById("lobbyPage");
const caseFilesPage = document.getElementById("caseFilesPage");
const settingsPage = document.getElementById("settingsPage");
const pricingPage = document.getElementById("pricingPage");

const lobby = document.getElementById("lobby");
const caseFiles = document.getElementById("caseFiles");
const settings = document.getElementById("settings");
const pricing = document.getElementById("pricing");


const historyList = document.getElementById("historyList");
const historyLoader = document.getElementById("historyLoader");
const historyEnd = document.getElementById("historyEnd");

function showPage(pageName = "lobby") {
    if (pageName === "lobby" || !pageName) {
        lobbyPage.style.display = "block";
    } else {
        lobbyPage.style.display = "none";
    }

    if (pageName === "caseFiles") {
        caseFilesPage.style.display = "block";
    } else {
        caseFilesPage.style.display = "none";
    }

    if (pageName === "settings") {
        settingsPage.style.display = "block";
    } else {
        settingsPage.style.display = "none";
    }

    if (pageName === "pricing") {
        pricingPage.style.display = "block";
    } else {
        pricingPage.style.display = "none";
    }
}

lobby.addEventListener("click", function () {
    console.log("clicked lobby");
    showPage("lobby");
});

caseFiles.addEventListener("click", function () {
    console.log("clicked case files");
    showPage("caseFiles");
});

settings.addEventListener("click", function () {
    console.log("clicked settings");
    showPage("settings");
});

pricing.addEventListener("click", function () {
    console.log("clicked pricing");
    showPage("pricing");
});


showPage();
