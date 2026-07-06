const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");

const authRouter = require("./routers/auth_router");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
        
        let email = null;
        if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
        }

        let picture = null;

        if (profile.photos && profile.photos.length > 0) {
            picture = profile.photos[0].value;
        }

        const user = {
        googleId: profile.id,
        displayName: profile.displayName,
        email: email,
        picture: picture,
        };

      done(null, user);
    }
  )
);

app.use(express.static("static"));
app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});