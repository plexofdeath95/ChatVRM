import { OpenAI } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIVoice } from "@/stores/imageInteractionStore";

type Data = {
  audio: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { message, apiKey, voice } = req.body;

    if (!message || !apiKey) {
      return res.status(400).json({ audio: "Missing message or API key." });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      input: message,
      voice: voice,
    });

    const buffer = await ttsResponse.arrayBuffer();

    const audioBase64 = Buffer.from(buffer).toString("base64");

    res.status(200).json({ audio: `data:audio/mp3;base64,${audioBase64}` });
  } catch (error) {
    console.error("Error generating TTS:", error);
    res.status(500).json({ audio: "Error generating audio." });
  }
}
