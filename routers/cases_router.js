const express = require("express");
const { Op } = require("sequelize");

const { Case } = require("../models/cases");
const { User } = require("../models/users");
const { requireAuth } = require("./auth_router");

const router = express.Router();

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function casesForUser(userId) {
  const where = {};

  where[Op.or] = [{ userOneId: userId }, { userTwoId: userId }];

  return where;
}

function completedCasesForUser(userId) {
  const where = casesForUser(userId);

  where.status = "complete";

  return where;
}

function readWholeNumber(value, fallbackValue) {
  const parsedValue = parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    return fallbackValue;
  }

  if (parsedValue < 0) {
    return fallbackValue;
  }

  return parsedValue;
}

function getResult(debateCase, userId) {
  if (debateCase.status !== "complete") {
    return "pending";
  }

  if (!debateCase.winnerUserId) {
    return "tied";
  }

  if (debateCase.winnerUserId === userId) {
    return "won";
  }

  return "lost";
}

function getOpponentName(debateCase, opponent) {
  if (!opponent) {
    return null;
  }

  if (!debateCase.userTwoId) {
    return null;
  }

  if (debateCase.userTwoId === debateCase.userOneId) {
    return null;
  }

  if (opponent.name) {
    return opponent.name;
  }

  return opponent.email;
}

function describeCase(debateCase, userId) {
  let opponent = null;
  let mySide = null;
  let opponentSide = null;
  let myScore = null;
  let opponentScore = null;

  if (debateCase.userOneId === userId) {
    opponent = debateCase.userTwo;
    mySide = debateCase.userOneSide;
    opponentSide = debateCase.userTwoSide;
    myScore = debateCase.userOneScore;
    opponentScore = debateCase.userTwoScore;
  } else {
    opponent = debateCase.userOne;
    mySide = debateCase.userTwoSide;
    opponentSide = debateCase.userOneSide;
    myScore = debateCase.userTwoScore;
    opponentScore = debateCase.userOneScore;
  }

  const describedCase = {
    id: debateCase.id,
    roomCode: debateCase.roomCode,
    topic: debateCase.topic,
    status: debateCase.status,
    result: getResult(debateCase, userId),
    createdAt: debateCase.createdAt,
    completedAt: debateCase.completedAt,
    mySide: mySide,
    opponentSide: opponentSide,
    myScore: myScore,
    opponentScore: opponentScore,
    opponentName: getOpponentName(debateCase, opponent),
    verdictSummary: debateCase.verdictSummary,
  };

  return describedCase;
}

async function getStanding(userId) {
  const heard = await Case.count({
    where: completedCasesForUser(userId),
  });

  const wonWhere = completedCasesForUser(userId);
  wonWhere.winnerUserId = userId;

  const won = await Case.count({ where: wonWhere });

  const tiedWhere = completedCasesForUser(userId);
  tiedWhere.winnerUserId = null;

  const tied = await Case.count({ where: tiedWhere });

  const pendingWhere = casesForUser(userId);
  pendingWhere.status = { [Op.ne]: "complete" };

  const pending = await Case.count({ where: pendingWhere });

  const lost = heard - won - tied;

  let winRate = 0;

  if (heard > 0) {
    winRate = Math.round((won / heard) * 100);
  }

  const standing = {
    heard: heard,
    won: won,
    lost: lost,
    tied: tied,
    pending: pending,
    winRate: winRate,
  };

  return standing;
}

router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    let limit = readWholeNumber(req.query.limit, DEFAULT_LIMIT);

    if (limit > MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    const offset = readWholeNumber(req.query.offset, 0);

    const standing = await getStanding(userId);

    const foundCases = await Case.findAndCountAll({
      where: casesForUser(userId),
      include: [
        {
          model: User,
          as: "userOne",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "userTwo",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
      limit: limit,
      offset: offset,
      distinct: true,
    });

    const cases = [];

    for (let index = 0; index < foundCases.rows.length; index += 1) {
      const debateCase = foundCases.rows[index];

      cases.push(describeCase(debateCase, userId));
    }

    let hasMore = false;

    if (offset + cases.length < foundCases.count) {
      hasMore = true;
    }

    return res.status(200).json({
      standing: standing,
      cases: cases,
      total: foundCases.count,
      hasMore: hasMore,
    });
  } catch (error) {
    console.error("Case history error:", error);
    return res.status(500).json({ error: "Could not load case history." });
  }
});

module.exports = router;