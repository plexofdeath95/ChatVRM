import { IconButton } from "./iconButton";
import { Message } from "@/features/messages/messages";
import { KoeiroParam } from "@/features/constants/koeiroParam";
import { ChatLog } from "./chatLog";
import React, { useCallback, useContext, useRef, useState } from "react";
import { Settings } from "./settings";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { AssistantText } from "./assistantText";
import { OpenAIVoice } from "@/stores/imageInteractionStore";
import { TransformModeUI } from "./TransformGizmo/TransformModeUI";

type Props = {
  systemPrompt: string;
  chatLog: Message[];
  koeiroParam: KoeiroParam;
  assistantMessage: string;
  koeiromapKey: string;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiromapParam: (x: number, y: number) => void;
  handleClickResetChatLog: () => void;
  handleClickResetSystemPrompt: () => void;
  onChangeKoeiromapKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedVoice: OpenAIVoice;
  onChangeVoice: (voice: OpenAIVoice) => void;
};

export const Menu = ({
  systemPrompt,
  chatLog,
  koeiroParam,
  assistantMessage,
  koeiromapKey,
  onChangeSystemPrompt,
  onChangeChatLog,
  onChangeKoeiromapParam,
  handleClickResetChatLog,
  handleClickResetSystemPrompt,
  onChangeKoeiromapKey,
  selectedVoice,
  onChangeVoice,
}: Props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showKoeiromapKey, setShowKoeiromapKey] = useState(false);
  const { viewer } = useContext(ViewerContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="absolute right-20 top-20 m-24">
        <IconButton
          iconName="24/Menu"
          isProcessing={false}
          onClick={() => setShowSettings(true)}
        ></IconButton>
      </div>
      {showSettings && (
        <Settings
          systemPrompt={systemPrompt}
          chatLog={chatLog}
          selectedVoice={selectedVoice}
          onClickClose={() => setShowSettings(false)}
          onChangeSystemPrompt={onChangeSystemPrompt}
          onChangeChatLog={onChangeChatLog}
          onChangeKoeiroParam={onChangeKoeiromapParam}
          onClickOpenVrmFile={() => {}}
          onClickResetChatLog={handleClickResetChatLog}
          onClickResetSystemPrompt={handleClickResetSystemPrompt}
          onChangeKoeiromapKey={onChangeKoeiromapKey}
          onChangeVoice={onChangeVoice}
        />
      )}
      <div className="absolute bottom-0 left-0 mb-104  w-full flex flex-col">
        <TransformModeUI />
        {!showKoeiromapKey && assistantMessage && (
          <AssistantText message={assistantMessage} />
        )}
      </div>
      <input
        type="file"
        className="hidden"
        accept=".vrm"
        ref={fileInputRef}
        onChange={() => {}}
      />
    </>
  );
};
