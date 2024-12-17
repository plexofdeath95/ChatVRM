import { OpenAI } from "openai";

export async function synthesizeVoice(message: string, apiKey: string) {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const ttsResponse = await openai.audio.speech.create({
    model: "tts-1",
    input: message,
    voice: "alloy",
  });

  const buffer = await ttsResponse.arrayBuffer();

  const audioBase64 = Buffer.from(buffer).toString("base64");
  return { audio: `data:audio/mp3;base64,${audioBase64}` };
}

export async function synthesizeVoiceApi(message: string, apiKey: string) {
  const body = {
    message: message,
    apiKey: apiKey,
  };

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { audio: string };

  return { audio: data.audio };
}
