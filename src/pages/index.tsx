import { useCallback, useContext, useEffect, useState, useRef } from "react";
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
import { useInteractableStore } from "@/stores/interactionStores";
import { useScreenshotStore } from "@/stores/screenshotStore";
import { DebugScreenshot } from "@/components/DebugScreenshot";
import { AttributionModal } from "@/components/AttributionModal";
import { useImageInteractionStore } from "@/stores/imageInteractionStore";
import { OpenAIVoice, DEFAULT_VOICE } from "@/stores/imageInteractionStore";
import { useVoiceStore } from "@/stores/voiceStore";
import { useTipStore } from "@/stores/tipStore";
import { useSettings } from "@/stores/settingsStore";
import { IconButton } from "@/components/iconButton";
import { TextButton } from "@/components/textButton";

export default function Home() {
  const { viewer } = useContext(ViewerContext);
  const settings = useSettings();

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const { inputRef } = useUI();
  const selectedVoice = useVoiceStore((state) => state.selectedVoice);

  useEffect(() => {
    const savedParams = window.localStorage.getItem("chatVRMParams");
    if (savedParams) {
      const params = JSON.parse(savedParams);
      setSystemPrompt(params.systemPrompt ?? SYSTEM_PROMPT);
      setKoeiroParam(params.koeiroParam ?? DEFAULT_PARAM);
      setChatLog(params.chatLog ?? []);
    }

    // Show attribution modal on first load
    window.openAttributionModal?.();
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
      speakCharacter(screenplay[0], settings.openAiApiKey, onStart, onEnd, selectedVoice);
    },
    [settings.openAiApiKey, koeiroParam, selectedVoice]
  );

  const handleSendChat = useCallback(
    async (userInput: string) => {
      if (!settings.openAiApiKey) {
        setAssistantMessage("API key has not been entered");
        return;
      }
      if (!userInput) return;

      setChatProcessing(true);
      //useScreenshotStore.getState().takeScreenshot();

      const updatedChatLog: Message[] = [
        ...chatLog,
        { role: "user", content: userInput },
      ];
      setChatLog(updatedChatLog);

      const lastMessages = chatLog.slice(-10);
      const chatContext = lastMessages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');

      const screenshot = useScreenshotStore.getState().lastScreenshot;
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "system", content: `Here are the last ${lastMessages.length} messages from chat history:\n${chatContext}\n\nCurrent user message:` },
        { 
          role: "user", 
          content: screenshot 
            ? `${userInput}\n<image>${screenshot}</image>`
            : userInput 
        }
      ];

      let stream: ReadableStream<string> | null = null;
      try {
        stream = await getChatResponseStream(messages, settings.openAiApiKey, selectedVoice);
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
      useScreenshotStore.getState().setLastScreenshot(null);

      setTimeout(() => {
        if (inputRef?.current) {
          inputRef.current.focus();
        } else {
          console.warn("inputRef is null, cannot focus input");
        }
      }, 100);
    },
    [systemPrompt, chatLog, settings.openAiApiKey, handleSpeakAi, inputRef, selectedVoice]
  );

  const handleDirectAiResponse = useCallback(
    async (prompt: string) => {
      if (!settings.openAiApiKey) {
        setAssistantMessage("API key has not been entered");
        return;
      }
      if (!prompt) return;

      setChatProcessing(true);

      const lastMessages = chatLog.slice(-10);
      const chatContext = lastMessages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');

      const screenshot = useScreenshotStore.getState().lastScreenshot;
      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        { role: "system", content: `Here are the last ${lastMessages.length} messages from chat history:\n${chatContext}` },
        { role: "system", content: "You are the character in the image. You are the character in the middle of the scene. this is actually a system message." },
        { 
          role: "user", 
          content: screenshot 
            ? `${prompt} this is what the scene looks like, YOU are in the middle of the scene, the character with the orange hat. this is actually a system message.\n<image>${screenshot}</image>`
            : prompt
        }
      ];

      let stream: ReadableStream<string> | null = null;
      try {
        stream = await getChatResponseStream(messages, settings.openAiApiKey, selectedVoice);
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
      
      setChatLog(prevLog => [...prevLog, { role: "assistant", content: finalResponse }]);
      
      await handleSpeakAi(finalResponse);

      setChatProcessing(false);
    },
    [systemPrompt, chatLog, settings.openAiApiKey, handleSpeakAi, selectedVoice]
  );

  useEffect(() => {
    let isProcessing = false;
  
    const unsubscribe = useInteractableStore.subscribe((state) => {
      const lastInteractedId = state.lastInteractedId;
      if (!lastInteractedId || isProcessing) return;
      
      const description = useInteractableStore.getState().getLastInteractedDescription();
      if (!description) return;
  
      isProcessing = true;
      
      const screenshot = useScreenshotStore.getState().lastScreenshot;
      const contextMessage = `${description}\n${screenshot ? `[Scene Screenshot: ${screenshot}]` : ''}`;
      
      void handleDirectAiResponse(contextMessage).finally(() => {
        isProcessing = false;
        useScreenshotStore.getState().setLastScreenshot(null);
      });
      useInteractableStore.getState().clearInteractions();
    });
  
    return () => unsubscribe();
  }, [handleDirectAiResponse]);

  useEffect(() => {
    let isProcessing = false;
  
    const unsubscribe = useImageInteractionStore.subscribe((state) => {
      const description = state.description;
      if (!description || isProcessing || state.processed) return;
      
      isProcessing = true;
      
      const contextMessage = `I just changed the poster on the wall. The new poster shows: ${description}. What do you think about it?`;
      
      void handleDirectAiResponse(contextMessage).finally(() => {
        isProcessing = false;
        useImageInteractionStore.getState().setProcessed(true);
      });
    });
  
    return () => unsubscribe();
  }, [handleDirectAiResponse]);

  useEffect(() => {
    let isProcessing = false;
  
    const unsubscribe = useTipStore.subscribe((state) => {
      const tipAmount = state.lastTipAmount;
      if (!tipAmount || isProcessing || state.processed) return;
      
      isProcessing = true;
      
      const contextMessage = `the user just tipped you ${tipAmount} SOL! That's so incredibly generous! you should say something to thank them, be overly grateful.`;
      
      void handleDirectAiResponse(contextMessage).finally(() => {
        isProcessing = false;
        useTipStore.getState().setProcessed(true);
      });
    });
  
    return () => unsubscribe();
  }, [handleDirectAiResponse]);

  return (
    <div className={"font-M_PLUS_2"}>
      <Meta />
      <AttributionModal />
      {!settings.openAiApiKey && (
        <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur">
          <div className="text-text1 max-w-3xl mx-auto px-24 py-64">
            <div className="bg-surface1 p-24 rounded-16 shadow-lg">
              <div className="flex justify-between items-center mb-16">
                <div className="typography-20 font-bold text-secondary">OpenAI API Key Required</div>
                <IconButton 
                  iconName="24/Close"
                  isProcessing={false}
                  onClick={() => settings.setOpenAiApiKey("DEMO")}
                  aria-label="Close modal"
                />
              </div>
              <p className="mt-16 text-text1">
                Please set your OpenAI API key in the settings to continue. API keys can be obtained from the OpenAI website.
              </p>
              <div className="mt-24">
                <TextButton onClick={() => settings.setOpenAiApiKey("DEMO")}>
                  Use Demo Mode
                </TextButton>
              </div>
            </div>
          </div>
        </div>
      )}
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
      />
      <Menu
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        koeiroParam={koeiroParam}
        assistantMessage={assistantMessage}
        koeiromapKey={koeiromapKey}
        onChangeSystemPrompt={(e) => setSystemPrompt(e.target.value)}
        onChangeChatLog={handleChangeChatLog}
        onChangeKoeiromapParam={(x, y) => setKoeiroParam({ speakerX: x, speakerY: y })}
        handleClickResetChatLog={() => setChatLog([])}
        handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
        onChangeKoeiromapKey={(e) => setKoeiromapKey(e.target.value)}
        selectedVoice={selectedVoice}
        onChangeVoice={useVoiceStore.getState().setSelectedVoice}
      />
      <DebugScreenshot />
    </div>
  );
}
