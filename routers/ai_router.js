const express = require("express");
const OpenAI = require("openai");

const { Case } = require("../models/cases");
const { Message } = require("../models/debate_messages");
const {DebateAnalysis} = require("../models/debate_analysis");
const { requireAuth } = require("./auth_router");

const router = express.Router();


async function analyzeDebateTurn(caseId, messageId) {

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OpenAI key");
  }

  const debateCase = await Case.findByPk(caseId);
  const currentMessage = await Message.findByPk(messageId);

  if (!debateCase) {
    throw new Error("Debate case not found");
  }

  if (!currentMessage || currentMessage.caseId !== debateCase.id) {
    throw new Error("Debate message not found");
  }

  const analysisResult = await DebateAnalysis.findOrCreate({
    where: { caseId: debateCase.id },
  });

  const savedDebateAnalysis = analysisResult[0];
  const currentAnalysis = savedDebateAnalysis.analysis;

  const allPreviousArguments = currentAnalysis.playerA.arguments.concat(
    currentAnalysis.playerB.arguments,
  );

  const alreadyAnalyzed = allPreviousArguments.find(function (argument) {
    return argument.messageId === currentMessage.id;
  });

  if (alreadyAnalyzed) {
    return alreadyAnalyzed;
  }

  let playerKey;
  let playerLetter;
  let speaker;

  if (currentMessage.userId === debateCase.userOneId) {
    playerKey = "playerA";
    playerLetter = "A";
    speaker = "Player A";
  } else if (currentMessage.userId === debateCase.userTwoId) {
    playerKey = "playerB";
    playerLetter = "B";
    speaker = "Player B";
  } else {
    throw new Error("Message user is not part of this debate");
  }

  const playerArguments = currentAnalysis[playerKey].arguments;
  const argumentNumber = playerArguments.length + 1;
  const argumentId = playerLetter + argumentNumber;
  const turnNumber = currentAnalysis.lastProcessedTurn + 1;

  const messages = await Message.findAll({
    where: { caseId: debateCase.id },
    order: [
        ["createdAt", "ASC"],
        ["id", "ASC"],
      ],
  });

  const currentMessageIndex = messages.findIndex(function (message) {
    return message.id === currentMessage.id;
  });

  const previousMessages = messages.slice(0, currentMessageIndex);
  const previousTranscripts = [];

  previousMessages.forEach(function (message) {
    const savedArgument = allPreviousArguments.find(function (argument) {
      return argument.messageId === message.id;
    });

    let savedArgumentId = null;
    let previousSpeaker = "Unknown";

    if (savedArgument) {
      savedArgumentId = savedArgument.argumentId;
    }

    if (message.userId === debateCase.userOneId) {
      previousSpeaker = "Player A";
    } else if (message.userId === debateCase.userTwoId) {
      previousSpeaker = "Player B";
    }

    previousTranscripts.push({
      argumentId: savedArgumentId,
      messageId: message.id,
      speaker: previousSpeaker,
      transcript: message.content,
    });
  });

  const currentTurn = {
    argumentId: argumentId,
    messageId: currentMessage.id,
    turnNumber: turnNumber,
    speaker: speaker,
    transcript: currentMessage.content,
  };

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
  You are monitoring an ongoing debate.

  Debate topic:
  ${debateCase.topic}

  Previous raw transcripts:
  ${JSON.stringify(previousTranscripts, null, 2)}

  Existing structured debate analysis:
  ${JSON.stringify(currentAnalysis, null, 2)}

  New argument to analyze:
  ${JSON.stringify(currentTurn, null, 2)}

  The previous raw transcripts are the source of truth.
  The existing structured analysis is read-only context.

  Analyze only the new argument.

  Determine:
  1. Its main claim.
  2. Its supporting points.
  3. Which previous arguments it responds to.
  4. Which previous arguments it directly challenges.
  5. Which points are genuinely new.
  6. Which previous arguments it repeats.
  7. Whether repeated points include meaningful new support.
  8. Whether it possibly contradicts the same speaker's earlier arguments.
  9. Its specificity and relevance.

  When referencing an earlier argument, use its argumentId.

  Relationship rules:

  - respondsTo and challenges may only reference arguments from the opposing speaker.
  - repeatedArguments may only reference earlier arguments from the same speaker.
  - possibleContradictions may only reference earlier arguments from the same speaker.
  - Mentioning an opponent's idea while rebutting it is not repetition.
  - A speaker's first argument must always have an empty repeatedArguments array.
  - Only mark repetition when the speaker substantially restates their own earlier
    claim or supporting point.
  - If the speaker repeats an earlier point but adds meaningful evidence or reasoning,
    set addsNewSupport to true.

  Do not rewrite or return the existing debate analysis.
  Do not decide the winner.

  Return ONLY valid JSON in this exact format:
  {
    "mainClaim": "...",
    "supportingPoints": ["..."],
    "respondsTo": [
      {
        "argumentId": "B1",
        "explanation": "..."
      }
    ],
    "challenges": [
      {
        "argumentId": "B1",
        "explanation": "..."
      }
    ],
    "newArguments": ["..."],
    "repeatedArguments": [
      {
        "argumentId": "A1",
        "explanation": "...",
        "addsNewSupport": false
      }
    ],
    "possibleContradictions": [
      {
        "argumentId": "A1",
        "explanation": "..."
      }
    ],
    "specificity": "medium",
    "relevance": "high"
  }

  Use empty arrays when no relationship exists.
  specificity must be "low", "medium", or "high".
  relevance must be "low", "medium", or "high".
  `;

  savedDebateAnalysis.status = "processing";
await savedDebateAnalysis.save();

try {
  currentMessage.analysisStatus = "processing";
await currentMessage.save();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    text: {
    format: {
      type: "json_object",
    },
    },
  });

  const newArgumentAnalysis = JSON.parse(response.output_text);

  newArgumentAnalysis.argumentId = argumentId;
  newArgumentAnalysis.messageId = currentMessage.id;
  newArgumentAnalysis.turnNumber = turnNumber;

  currentAnalysis[playerKey].arguments.push(newArgumentAnalysis);
  currentAnalysis.lastProcessedTurn = turnNumber;

  savedDebateAnalysis.analysis = currentAnalysis;
  savedDebateAnalysis.lastProcessedMessageId = currentMessage.id;
  savedDebateAnalysis.status = "idle";

  savedDebateAnalysis.changed("analysis", true);
  await savedDebateAnalysis.save();

  currentMessage.analysisStatus = "complete";
  await currentMessage.save();

  return newArgumentAnalysis;
} catch (error) {
  savedDebateAnalysis.status = "failed";
  await savedDebateAnalysis.save();

  currentMessage.analysisStatus = "failed";
  await currentMessage.save();

  throw error;

  }
}

async function getAiRuling(topic, argumentsList, debateAnalysis) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OpenAI key");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const formattedArguments = argumentsList
    .map((argument, index) => {
      return `Turn ${index + 1} - ${argument.speaker}: ${argument.text}`;
    })
    .join("\n");

  const prompt = `
You are an impartial debate judge.

Debate topic:
${topic}

Debate transcript:
${formattedArguments}

Structured debate analysis:
${JSON.stringify(debateAnalysis, null, 2)}

The original transcript is the source of truth.
Use the structured analysis as additional help for identifying responses,
repetition, contradictions, and new arguments.

Your job:

You have access to web search.

Use web search to verify factual claims that could affect the debate outcome.
Do not use web search to judge opinions, values, or personal preferences.

When checking a factual claim:
- prefer reliable sources such as universities, governments, research organizations,
  and established news organizations
- classify the claim as "supported", "disputed", "misleading", or "unverifiable"
- do not invent sources
- include the title and URL of every source used
- only penalize a player when an inaccurate factual claim materially affects
  their argument

If the debate contains no important factual claims that require verification,
return an empty factChecks array.

1. Decide the winner between Player A and Player B, or declare Tie.

2. Judge each side using this rubric:
   - relevance to the topic
   - response to the opponent's previous point
   - non-repetition
   - specificity
   - logical strength
   - persuasiveness
   - consistency with their own earlier points
   - factual accuracy of verifiable claims

3. Apply penalties when:
   - a speaker ignores the opponent's previous argument in a rebuttal turn
   - a speaker repeats an earlier point without adding meaningful new substance
   - a speaker gives vague filler instead of an actual argument
   - a speaker contradicts their own earlier argument without explanation

4. Prefer arguments that directly engage the opponent, add new substance, and advance the debate.

5. Ignore grammar mistakes unless they affect meaning.

6. Return ONLY valid JSON in this exact format:
{
  "winner": "Tie",
  "reasoning": "...",
  "rubric_breakdown": {
    "playerA": {
      "relevance": 4,
      "rebuttal": 4,
      "non_repetition": 4,
      "clarity": 4,
      "factual_accuracy": 4
    },
    "playerB": {
      "relevance": 4,
      "rebuttal": 4,
      "non_repetition": 4,
      "clarity": 4,
      "factual_accuracy": 4
    }
  },
  "factChecks": [
    {
      "speaker": "Player A",
      "claim": "...",
      "assessment": "supported",
      "explanation": "...",
      "sources": [
        {
          "title": "...",
          "url": "https://..."
        }
      ]
    }
  ]
}
assessment must be "supported", "disputed", "misleading", or "unverifiable".
Use an empty factChecks array when no important factual claims were checked.
Every source must contain a real title and URL returned from web search.
7. Do not assume a longer argument is better. Quality of reasoning matters more than length.
8. If both sides are extremely close, set winner to "Tie".
`;

  const response = await client.responses.create({
  model: "gpt-5.6-luna",
  input: prompt,
  tools: [
    {
      type: "web_search",
    },
  ],
});

  return JSON.parse(response.output_text);
}

const RUBRIC_KEYS = [
  "relevance",
  "rebuttal",
  "non_repetition",
  "clarity",
  "factual_accuracy",
];

function scoreFromRubric(rubricSide) {
  if (!rubricSide) {
    return null;
  }

  let total = 0;
  let counted = 0;

  RUBRIC_KEYS.forEach(function (key) {
    if (typeof rubricSide[key] === "number") {
      total += rubricSide[key];
      counted += 1;
    }
  });

  if (counted === 0) {
    return null;
  }

  return total;
}

function speakerForMessage(debateCase, message) {
  if (message.userId === debateCase.userOneId) {
    return "Player A";
  }

  if (message.userId === debateCase.userTwoId) {
    return "Player B";
  }

  return "Unknown";
}

async function finalizeCaseRuling(caseId) {
  const debateCase = await Case.findByPk(caseId);

  if (!debateCase) {
    throw new Error("Debate case not found");
  }

  if (debateCase.status === "complete" && debateCase.ruling) {
    return debateCase.ruling;
  }

  const messages = await Message.findAll({
    where: { caseId: debateCase.id },
    order: [
      ["createdAt", "ASC"],
      ["id", "ASC"],
    ],
  });

  if (messages.length === 0) {
    throw new Error("No arguments to rule on");
  }

  const argumentsList = messages.map(function (message) {
    return {
      speaker: speakerForMessage(debateCase, message),
      text: message.content,
    };
  });

  const savedDebateAnalysis = await DebateAnalysis.findOne({
    where: { caseId: debateCase.id },
  });

  let structuredAnalysis = null;

  if (savedDebateAnalysis) {
    structuredAnalysis = savedDebateAnalysis.analysis;
  }

  const ruling = await getAiRuling(
    debateCase.topic,
    argumentsList,
    structuredAnalysis,
  );

  let winnerUserId = null;

  if (ruling.winner === "Player A") {
    winnerUserId = debateCase.userOneId;
  } else if (ruling.winner === "Player B") {
    winnerUserId = debateCase.userTwoId;
  }

  const rubric = ruling.rubric_breakdown || {};

  debateCase.ruling = ruling;
  debateCase.winnerUserId = winnerUserId;
  debateCase.verdictSummary = ruling.reasoning || null;
  debateCase.userOneScore = scoreFromRubric(rubric.playerA);
  debateCase.userTwoScore = scoreFromRubric(rubric.playerB);
  debateCase.status = "complete";
  debateCase.completedAt = new Date();

  debateCase.changed("ruling", true);
  await debateCase.save();

  return ruling;
}

router.post("/ruling", requireAuth, async (req, res) => {
  try {
    const { caseId, roomCode } = req.body;

    if (!caseId && !roomCode) {
      return res.status(400).json({ error: "caseId or roomCode is required." });
    }

    let debateCase = null;

    if (caseId) {
      debateCase = await Case.findByPk(caseId);
    } else {
      debateCase = await Case.findOne({ where: { roomCode: roomCode } });
    }

    if (!debateCase) {
      return res.status(404).json({ error: "Debate case not found." });
    }

    const isParticipant =
      debateCase.userOneId === req.user.id ||
      debateCase.userTwoId === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({ error: "Not part of this debate." });
    }

    const ruling = await finalizeCaseRuling(debateCase.id);

    return res.status(200).json(ruling);
  } catch (error) {
    console.error("AI ruling error:", error);
    return res.status(500).json({
      error: "Failed to generate ruling.",
    });
  }
});

module.exports = {router, getAiRuling, analyzeDebateTurn, finalizeCaseRuling,};