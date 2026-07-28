const express = require("express");
const passport = require("passport");

const router = express.Router();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const startGoogleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const handleGoogleCallback = passport.authenticate("google", {
  failureRedirect: `${frontendUrl}?authError=google`,
});

router.get("/google", startGoogleAuth);

router.get("/google/callback", handleGoogleCallback, (req, res) => {
  res.redirect(frontendUrl);
});

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(200).json({ user: null });
  }

  res.status(200).json({ user: req.user });
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });
});

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  next();
}

module.exports = { router, requireAuth };
