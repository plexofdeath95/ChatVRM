import { useUI } from "@/stores/uiStore";
import { IconButton } from "./iconButton";
import React, { useRef, useEffect } from "react";
import { TransformModeUI } from "./TransformGizmo/TransformModeUI";

type Props = {
  userMessage: string;
  isMicRecording: boolean;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClickSendButton: () => void;
  onClickMicButton: () => void;
};

export const MessageInput = ({
  userMessage,
  isMicRecording,
  isChatProcessing,
  onChangeUserMessage,
  onClickMicButton,
  onClickSendButton,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setInputRef } = useUI();

  useEffect(() => {
    setInputRef(inputRef);
    inputRef?.current?.focus();
  }, [setInputRef]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !isChatProcessing) {
      onClickSendButton();
    }
  };

  return (
    <div className="absolute bottom-0 z-20 w-screen">
      <div className={`flex flex-col`} style={{ gap: "1rem" }}>
        <TransformModeUI />
        <div className="bg-base text-black">
          <div className="mx-auto max-w-4xl p-16">
            <div className="grid grid-flow-col gap-[8px] grid-cols-[min-content_1fr_min-content]">
              <IconButton
                iconName="24/Microphone"
                className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
                isProcessing={isMicRecording}
                disabled={isChatProcessing}
                onClick={onClickMicButton}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter what you want to ask"
                onChange={onChangeUserMessage}
                onKeyDown={handleKeyDown}
                disabled={isChatProcessing}
                className="bg-surface1 hover:bg-surface1-hover focus:bg-surface1 disabled:bg-surface1-disabled disabled:text-primary-disabled rounded-16 w-full px-16 text-text-primary typography-16 font-bold"
                value={userMessage}
              />
              <IconButton
                iconName="24/Send"
                className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
                isProcessing={isChatProcessing}
                disabled={isChatProcessing || !userMessage}
                onClick={onClickSendButton}
              />
            </div>
          </div>
          <div className="py-4 bg-[#413D43] text-center text-white font-Montserrat">
            powered by VRoid, Koemotion, ChatGPT API
          </div>
        </div>
      </div>
    </div>
  );
};
