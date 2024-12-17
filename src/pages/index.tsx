import { useCallback, useContext, useEffect, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { Message, textsToScreenplay } from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { Meta } from "@/components/meta";
import { useUI } from "@/stores/uiStore";

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState(
    process.env.NEXT_PUBLIC_OPENAI_API_KEY || ""
  );
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const { inputRef } = useUI();

  useEffect(() => {
    const savedParams = window.localStorage.getItem("chatVRMParams");
    if (savedParams) {
      const params = JSON.parse(savedParams);
      setSystemPrompt(params.systemPrompt ?? SYSTEM_PROMPT);
      setKoeiroParam(params.koeiroParam ?? DEFAULT_PARAM);
      setChatLog(params.chatLog ?? []);
    }
  }, []);

  useEffect(() => {
    const params = {
      systemPrompt,
      koeiroParam,
      chatLog,
    };
    window.localStorage.setItem("chatVRMParams", JSON.stringify(params));
  }, [systemPrompt, koeiroParam, chatLog]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((msg, i) =>
        i === targetIndex ? { role: msg.role, content: text } : msg
      );
      setChatLog(newChatLog);
    },
    [chatLog]
  );

  const handleSpeakAi = useCallback(
    async (text: string, onStart?: () => void, onEnd?: () => void) => {
      const screenplay = textsToScreenplay([text], koeiroParam);
      speakCharacter(screenplay[0], openAiKey, onStart, onEnd);
    },
    [koeiromapKey, koeiroParam]
  );

  const handleSendChat = useCallback(
    async (userInput: string) => {
      if (!openAiKey) {
        setAssistantMessage("API key has not been entered");
        return;
      }
      if (!userInput) return;

      setChatProcessing(true);

      const updatedChatLog: Message[] = [
        ...chatLog,
        { role: "user", content: userInput },
      ];
      setChatLog(updatedChatLog);

      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        ...updatedChatLog,
      ];

      let stream: ReadableStream<string> | null = null;
      try {
        stream = await getChatResponseStream(messages, openAiKey);
      } catch (error) {
        console.error("Error fetching the stream:", error);
        setAssistantMessage("Error fetching response. Check your API key.");
        setChatProcessing(false);
        return;
      }

      if (!stream) {
        setAssistantMessage("No response from API");
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let fullAssistantResponse = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            fullAssistantResponse += value;
            setAssistantMessage(fullAssistantResponse.trim());
          }
        }
      } catch (e) {
        console.error("Error while reading the stream:", e);
        setAssistantMessage("Error reading the response stream.");
      } finally {
        reader.releaseLock();
      }

      const finalResponse = fullAssistantResponse.trim();
      const finalChatLog: Message[] = [
        ...updatedChatLog,
        { role: "assistant", content: finalResponse },
      ];
      setChatLog(finalChatLog);

      await handleSpeakAi(finalResponse);

      setChatProcessing(false);

      setTimeout(() => {
        if (inputRef?.current) {
          inputRef.current.focus();
        } else {
          console.warn("inputRef is null, cannot focus input");
        }
      }, 100);
    },
    [systemPrompt, chatLog, openAiKey, handleSpeakAi, inputRef]
  );

  return (
    <div className={"font-M_PLUS_2"}>
      <Meta />
      {/* <Introduction
        openAiKey={openAiKey}
        koeiroMapKey={koeiromapKey}
        onChangeAiKey={setOpenAiKey}
        onChangeKoeiromapKey={setKoeiromapKey}
      /> */}
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
      />

      <Menu
        openAiKey={openAiKey}
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        koeiroParam={koeiroParam}
        assistantMessage={assistantMessage}
        koeiromapKey={koeiromapKey}
        onChangeAiKey={setOpenAiKey}
        onChangeSystemPrompt={setSystemPrompt}
        onChangeChatLog={handleChangeChatLog}
        onChangeKoeiromapParam={setKoeiroParam}
        handleClickResetChatLog={() => setChatLog([])}
        handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
        onChangeKoeiromapKey={setKoeiromapKey}
      />
    </div>
  );
}
