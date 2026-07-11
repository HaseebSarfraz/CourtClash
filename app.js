const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const { sequelize } = require("./datasource");
const { User } = require("./models/users");
const { Case } = require("./models/cases");

User.hasMany(Case, { foreignKey: "userOneId", as: "casesAsUserOne" });
User.hasMany(Case, { foreignKey: "userTwoId", as: "casesAsUserTwo" });
User.hasMany(Case, { foreignKey: "winnerUserId", as: "wonCases" });

Case.belongsTo(User, { foreignKey: "userOneId", as: "userOne" });
Case.belongsTo(User, { foreignKey: "userTwoId", as: "userTwo" });
Case.belongsTo(User, { foreignKey: "winnerUserId", as: "winner" });


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
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = null;
        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        }

        if (!email) {
          return done(new Error("Google account did not provide an email"), null);
        }

        let picture = null;
        if (profile.photos && profile.photos.length > 0) {
          picture = profile.photos[0].value;
        }

        let user = await User.findOne({
          where: { email: email },
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: email,
            subscriptionStatus: null,
          });
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

app.use(express.static("static"));
app.use("/auth", authRouter);

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: { drop: false } });
    console.log("Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

startServer();