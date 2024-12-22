import { OpenAI } from "openai";
import { Message } from "../messages/messages";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { OpenAIVoice } from "@/stores/imageInteractionStore";
import { DEFAULT_VOICE } from "@/stores/imageInteractionStore";

// Get Chat Response (Non-Streaming)
export async function getChatResponse(
  messages: Message[], 
  apiKey: string,
  voice: OpenAIVoice = DEFAULT_VOICE
) {
  if (!apiKey) {
    return { message: "Please provide an OpenAI API key" };
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Transform messages to include image content if present
    const transformedMessages: ChatCompletionMessageParam[] = messages.map((msg) => {
      if (typeof msg.content === "string" && msg.content.includes("<image>")) {
        const [text, imageData] = msg.content.split("<image>");
        const base64Image = imageData.split("</image>")[0];

        return {
          role: msg.role,
          content: [
            { type: "text", text },
            { type: "image_url", image_url: { url: base64Image } },
          ],
        } as ChatCompletionMessageParam;
      }

      return {
        role: msg.role,
        content: msg.content,
      } as ChatCompletionMessageParam;
    });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: transformedMessages,
      max_tokens: 200,
    });

    const message = chatResponse.choices[0]?.message?.content || "An error occurred";
    return { message };
  } catch (error) {
    return { message: "Error connecting to OpenAI: " + (error as Error).message };
  }
}

export async function getChatResponseStream(
  messages: Message[], 
  apiKey: string,
  voice: OpenAIVoice = DEFAULT_VOICE
): Promise<ReadableStream<string>> {
  if (!apiKey) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue("Please provide an OpenAI API key");
        controller.close();
      },
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Transform messages to include image content if present
    const transformedMessages: ChatCompletionMessageParam[] = messages.map((msg) => {
      if (typeof msg.content === "string" && msg.content.includes("<image>")) {
        const [text, imageData] = msg.content.split("<image>");
        const base64Image = imageData.split("</image>")[0];

        return {
          role: msg.role,
          content: [
            { type: "text", text },
            { type: "image_url", image_url: { url: base64Image } },
          ],
        } as ChatCompletionMessageParam;
      }

      return {
        role: msg.role,
        content: msg.content,
      } as ChatCompletionMessageParam;
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: transformedMessages,
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
  } catch (error) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue("Error connecting to OpenAI: " + (error as Error).message);
        controller.close();
      },
    });
  }
}
