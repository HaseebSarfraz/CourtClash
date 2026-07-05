const express = require("express");
const passport = require("passport");

const router = express.Router();

const startGoogleAuth = passport.authenticate("google", {
  scope: ["profile", "email"]
});

const handleGoogleCallback = passport.authenticate("google", {
  failureRedirect: "/"
});

router.get("/google", startGoogleAuth);

router.get("/google/callback", handleGoogleCallback, (req, res) => {
  res.redirect("/"); // attaches user to req.user and redirects to the home page
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

module.exports = router;