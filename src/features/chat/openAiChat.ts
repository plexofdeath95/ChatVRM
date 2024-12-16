// openAiChat.ts

import { Configuration, OpenAIApi } from "openai";
import { Message } from "../messages/messages";

export async function getChatResponse(messages: Message[], apiKey: string) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  // Workaround to prevent errors when making API calls from the browser
  delete configuration.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(configuration);

  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const [aiRes] = data.choices;
  const message = aiRes.message?.content || "An error occurred";

  return { message: message };
}

export async function getChatResponseStream(
  messages: Message[],
  apiKey: string
): Promise<ReadableStream<string>> {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
      stream: true,
      max_tokens: 200,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Failed to fetch: ${res.status} - ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  return new ReadableStream<string>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            buffer += decoder.decode(value, { stream: true });
          }

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed === "data: [DONE]") {
              controller.close();
              return;
            }

            if (trimmed.startsWith("data: ")) {
              const jsonStr = trimmed.replace(/^data:\s*/, "");
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed?.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(content);
                }
              } catch (err) {
                console.error(
                  "Failed to parse SSE JSON:",
                  err,
                  "Line:",
                  trimmed
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("Stream processing error:", err);
        controller.error(err);
      } finally {
        reader.releaseLock();
      }

      controller.close();
    },
  });
}
