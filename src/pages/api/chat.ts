import { Configuration, OpenAIApi } from "openai";

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

  const configuration = new Configuration({
    apiKey: apiKey,
  });

  const openai = new OpenAIApi(configuration);

  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: req.body.messages,
  });

  const [aiRes] = data.choices;
  const message = aiRes.message?.content || "An error occurred";

  res.status(200).json({ message: message });
}
