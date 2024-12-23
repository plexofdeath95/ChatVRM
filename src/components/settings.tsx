import React from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message } from "@/features/messages/messages";
import { Link } from "./link";
import { OpenAIVoice } from "@/stores/imageInteractionStore";
import { useVoiceStore } from "@/stores/voiceStore";
import { useVrmStore, availableVrms } from "@/stores/vrmStore";
import { useSettings } from "@/stores/settingsStore";

type Props = {
  systemPrompt: string;
  chatLog: Message[];
  selectedVoice: OpenAIVoice;
  onClickClose: () => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  onChangeKoeiromapKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeVoice: (voice: OpenAIVoice) => void;
};

export const Settings = ({
  chatLog,
  systemPrompt,
  selectedVoice,
  onClickClose,
  onChangeSystemPrompt,
  onChangeChatLog,
  onChangeKoeiroParam,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  onChangeKoeiromapKey,
  onChangeVoice,
}: Props) => {
  const { vrmUrl, setVrmUrl } = useVrmStore();
  const { openAiApiKey, setOpenAiApiKey } = useSettings();

  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
        ></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-3xl mx-auto px-24 py-64">
          <div className="my-24 typography-32 font-bold">Settings</div>

          <div className="my-24">
            <div className="my-16 typography-20 font-bold">OpenAI API Key</div>
            <input
              className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
              type="text"
              placeholder="sk-..."
              value={openAiApiKey}
              onChange={(e) => setOpenAiApiKey(e.target.value)}
            />
            <div>
              API keys can be obtained from
              <Link
                url="https://platform.openai.com/account/api-keys"
                label="OpenAI's website"
              />
              . Enter the acquired API key in the form.
            </div>
            <div className="my-16">
              The ChatGPT API is accessed directly from the browser. Neither API
              keys nor conversation content are stored on pixiv servers.
              <br />* The model being used is ChatGPT API (GPT-4o-mini).
            </div>
          </div>

          {/* VRM Selection Section */}
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">Select VRM</div>
            <div className="grid grid-cols-2 gap-8">
              {availableVrms.map((vrm) => (
                <div
                  key={vrm.name}
                  className={`border-2 rounded-lg p-4 cursor-pointer`}
                  onClick={() => setVrmUrl(vrm.url)}
                  style={{
                    borderColor: vrmUrl === vrm.url ? "#866393" : "transparent",
                  }}
                >
                  <img
                    src={vrm.previewImg}
                    alt={vrm.name}
                    className="w-full h-auto rounded-md"
                  />
                  <div className="mt-2 text-center font-medium">{vrm.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="my-40">
            <div className="my-16 typography-20 font-bold">OpenAI Voice</div>
            <select
              value={selectedVoice}
              onChange={(e) => onChangeVoice(e.target.value as OpenAIVoice)}
              className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
            >
              <option value="alloy">Alloy</option>
              <option value="echo">Echo</option>
              <option value="fable">Fable</option>
              <option value="onyx">Onyx</option>
              <option value="nova">Nova</option>
              <option value="shimmer">Shimmer</option>
            </select>
          </div>
          <div className="my-40">
            <div className="my-8">
              <div className="my-16 typography-20 font-bold">
                Character Settings (System Prompt)
              </div>
              <TextButton onClick={onClickResetSystemPrompt}>
                Reset Character Settings
              </TextButton>
            </div>
            <textarea
              value={systemPrompt}
              onChange={onChangeSystemPrompt}
              className="px-16 py-8  bg-surface1 hover:bg-surface1-hover h-168 rounded-8 w-full"
            ></textarea>
          </div>

          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-8 grid-cols-2">
                <div className="my-16 typography-20 font-bold">
                  Conversation History
                </div>
                <TextButton onClick={onClickResetChatLog}>
                  Reset Conversation History
                </TextButton>
              </div>
              <div className="my-8">
                {chatLog.map((value, index) => {
                  return (
                    <div
                      key={index}
                      className="my-8 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed"
                    >
                      <div className="w-[64px] py-8">
                        {value.role === "assistant" ? "Character" : "You"}
                      </div>
                      <input
                        key={index}
                        className="bg-surface1 hover:bg-surface1-hover rounded-8 w-full px-16 py-8"
                        type="text"
                        value={value.content}
                        onChange={(event) => {
                          onChangeChatLog(index, event.target.value);
                        }}
                      ></input>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
