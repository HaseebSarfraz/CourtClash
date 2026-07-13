const express = require("express");
const http = require("http");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { sequelize } = require("./datasource");
const { User, associateUserModels } = require("./models/users");
const { Case, associateCaseModels } = require("./models/cases");
const {
  DebateMessage,
  associateDebateMessageModels,
} = require("./models/debate_messages");

const allModels = { User, Case, DebateMessage };
associateUserModels(allModels);
associateCaseModels(allModels);
associateDebateMessageModels(allModels);


const authRouter = require("./routers/auth_router");

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const middleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
});

app.use(express.json());
app.use(middleware);
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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.engine.use(middleware);
io.engine.use(passport.initialize());
io.engine.use(passport.session());

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function getRoomCode() {
  let roomCode = randomCode();
  let found = await Case.findOne({ where: { roomCode } });

  while (found) {
    roomCode = randomCode();
    found = await Case.findOne({ where: { roomCode } });
  }

  return roomCode;
}

function cleanCase(debateCase) {
  return {
    id: debateCase.id,
    roomCode: debateCase.roomCode,
    topic: debateCase.topic,
    status: debateCase.status,
    userOneId: debateCase.userOneId,
    userTwoId: debateCase.userTwoId,
    userOneSide: debateCase.userOneSide,
    userTwoSide: debateCase.userTwoSide,
  };
}

async function getState(debateCase) {
  const messages = await DebateMessage.findAll({
    where: { caseId: debateCase.id },
    include: { model: User, as: "user", attributes: ["id", "name", "email"] },
    order: [["createdAt", "ASC"]],
  });

  return {
    room: cleanCase(debateCase),
    messages: messages.map((message) => ({
      id: message.id,
      caseId: message.caseId,
      userId: message.userId,
      content: message.content,
      createdAt: message.createdAt,
      user: message.user,
    })),
  };
}

function userInRoom(debateCase, userId) {
  return debateCase.userOneId === userId || debateCase.userTwoId === userId;
}

io.use((socket, next) => {
  if (!socket.request.user) {
    return next(new Error("You must be signed in to use debate rooms."));
  }

  next();
});

io.on("connection", (socket) => {
  const user = socket.request.user;

  socket.on("room:create", async (data, callback) => {
    try {
      const topic = data.topic.trim();
      const userOneSide = data.userOneSide.trim();
      const userTwoSide = data.userTwoSide.trim();

      if (!topic || !userOneSide || !userTwoSide) {
        return callback({ error: "Topic and sides are required." });
      }

      const debateCase = await Case.create({
        topic,
        roomCode: await getRoomCode(),
        userOneId: user.id,
        userTwoId: user.id,
        userOneSide,
        userTwoSide,
        status: "waiting",
      });

      socket.join(debateCase.roomCode);
      callback({ state: await getState(debateCase) });
    } catch (error) {
      console.error("room:create failed:", error);
      callback({ error: "Could not create room." });
    }
  });

  socket.on("room:join", async (data, callback) => {
    try {
      const roomCode = data.roomCode.trim().toUpperCase();
      const debateCase = await Case.findOne({ where: { roomCode } });

      if (!debateCase) {
        return callback({ error: "Room not found." });
      }

      if (debateCase.status === "waiting" && debateCase.userOneId !== user.id) {
        await debateCase.update({ userTwoId: user.id, status: "active" });
      }

      if (!userInRoom(debateCase, user.id)) {
        return callback({ error: "This room already has two debaters." });
      }

      socket.join(roomCode);
      const state = await getState(debateCase);
      io.to(roomCode).emit("room:state", state);
      callback({ state });
    } catch (error) {
      callback({ error: "Could not join room." });
    }
  });

  socket.on("room:message", async (data, callback) => {
    try {
      const roomCode = data.roomCode.trim().toUpperCase();
      const content = data.content.trim();
      const debateCase = await Case.findOne({ where: { roomCode } });

      if (!debateCase || !userInRoom(debateCase, user.id)) {
        return callback({ error: "You are not allowed to post in this room." });
      }

      if (!content) {
        return callback({ error: "Message cannot be empty." });
      }

      const message = await DebateMessage.create({
        caseId: debateCase.id,
        userId: user.id,
        content,
      });

      const savedMessage = await DebateMessage.findByPk(message.id, {
        include: { model: User, as: "user", attributes: ["id", "name", "email"] },
      });

      io.to(roomCode).emit("room:message", {
        id: savedMessage.id,
        caseId: savedMessage.caseId,
        userId: savedMessage.userId,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
        user: savedMessage.user,
      });

      callback({ ok: true });
    } catch (error) {
      callback({ error: "Could not send message." });
    }
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: { drop: false } });
    console.log("Database connected successfully.");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

const aiRouter = require("./routers/ai_router");
app.use("/ai", aiRouter);

startServer();
