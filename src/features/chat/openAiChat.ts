import { OpenAI } from "openai";
import { Message } from "../messages/messages";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Get Chat Response (Non-Streaming)
export async function getChatResponse(messages: Message[], apiKey: string) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 200,
  });

  const message =
    chatResponse.choices[0]?.message?.content || "An error occurred";
  return { message };
}

export async function getChatResponseStream(
  messages: Message[],
  apiKey: string
): Promise<ReadableStream<string>> {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    stream: true,
    max_tokens: 200,
  });

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(content);
          }
        }
      } catch (err) {
        console.error("Error reading completion stream:", err);
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}
