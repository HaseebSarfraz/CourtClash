const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ruling", async (req, res) => {
  try {
    const { topic, argumentsList } = req.body;

    if (!topic || !argumentsList || !Array.isArray(argumentsList)) {
      return res.status(400).json({
        error: "Topic and argumentsList are required.",
      });
    }

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

Your job:
1. Decide the winner between Player A and Player B, or declare Tie.
2. Judge based on relevance, clarity, consistency, specificity, and persuasiveness.
3. Ignore grammar mistakes unless they affect meaning.
4. Return ONLY valid JSON in this exact format:

{
  "winner": "Player A",
  "reasoning": "Short explanation here."
}

If neither side clearly wins, set winner to "Tie".
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const rawText = response.output_text;
    const parsed = JSON.parse(rawText);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("AI ruling error:", error);
    return res.status(500).json({
      error: "Failed to generate ruling.",
    });
  }
});

module.exports = router;