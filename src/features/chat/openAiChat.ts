import { OpenAI } from "openai";
import { Message } from "../messages/messages";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Get Chat Response (Non-Streaming)
export async function getChatResponse(messages: Message[], apiKey: string) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  // Transform messages to include image content if present
  const transformedMessages: ChatCompletionMessageParam[] = messages.map(msg => {
    if (typeof msg.content === 'string' && msg.content.includes('<image>')) {
      const [text, imageData] = msg.content.split('<image>');
      const base64Image = imageData.split('</image>')[0];
      
      return {
        role: msg.role,
        content: [
          { type: "text", text },
          { type: "image_url", image_url: { url: base64Image } }
        ]
      } as ChatCompletionMessageParam;
    }
    
    return {
      role: msg.role,
      content: msg.content
    } as ChatCompletionMessageParam;
  });

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: transformedMessages,
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

  // Transform messages to include image content if present
  const transformedMessages: ChatCompletionMessageParam[] = messages.map(msg => {
    if (typeof msg.content === 'string' && msg.content.includes('<image>')) {
      const [text, imageData] = msg.content.split('<image>');
      const base64Image = imageData.split('</image>')[0];
      
      return {
        role: msg.role,
        content: [
          { type: "text", text },
          { type: "image_url", image_url: { url: base64Image } }
        ]
      } as ChatCompletionMessageParam;
    }
    
    return {
      role: msg.role,
      content: msg.content
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
}
