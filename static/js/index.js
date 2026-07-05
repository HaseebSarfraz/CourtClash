import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home.jsx";

createRoot(document.getElementById("root")).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(Home),
  ),
);
