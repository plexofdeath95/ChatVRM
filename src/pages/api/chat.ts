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

    // Transform messages to include image content if present
    const messages = req.body.messages.map((msg: { content: { includes: (arg0: string) => any; split: (arg0: string) => [any, any]; }; role: any; }) => {
      if (msg.content.includes('<image>')) {
        const [text, imageData] = msg.content.split('<image>');
        const base64Image = imageData.split('</image>')[0];
        console.log(base64Image.length);
        return {
          role: msg.role,
          content: [
            { type: "text", text: text },
            { 
              type: "image_url", 
              image_url: { 
                url: base64Image 
              }
            }
          ]
        };
      }
      return msg;
    });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
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
