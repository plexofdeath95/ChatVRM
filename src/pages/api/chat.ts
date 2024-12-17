import { OpenAI } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const apiKey = req.body.apiKey || process.env.OPEN_AI_KEY;

  if (!apiKey) {
    res.status(400).json({ message: "The API key is incorrect or not set." });
    return;
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: req.body.messages,
      max_tokens: 200,
    });

    const message =
      chatResponse.choices[0]?.message?.content || "An error occurred";

    res.status(200).json({ message });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ message: "Failed to generate response." });
  }
}
