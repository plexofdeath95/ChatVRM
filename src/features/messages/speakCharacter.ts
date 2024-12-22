// speakCharacter.ts
import { wait } from "@/utils/wait";
import { synthesizeVoiceApi } from "./synthesizeVoice";
import { Screenplay, Talk } from "./messages";
import { useVrmStore } from "@/stores/vrmStore";
import { OpenAIVoice } from "@/stores/imageInteractionStore";
import { useVoiceStore } from "@/stores/voiceStore";

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return async (
    screenplay: Screenplay,
    openAIAPiKey: string,
    onStart?: () => void,
    onComplete?: () => void,
    voice?: OpenAIVoice
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      const buffer = await fetchAudio(screenplay.talk, openAIAPiKey).catch(
        (e) => {
          console.error("Error fetching audio:", e);
          return null;
        }
      );
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;

    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        const model = useVrmStore.getState().model;
        if (!model) {
          console.warn("VRM model is not loaded yet.");
          return;
        }

        if (!audioBuffer) {
          console.warn("No audio buffer fetched.");
          return;
        }

        onStart?.();
        return model.speak(audioBuffer, screenplay);
      }
    );
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
};

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (
  talk: Talk,
  apiKey: string,
): Promise<ArrayBuffer> => {
  const voice = useVoiceStore.getState().selectedVoice;
  const ttsVoice = await synthesizeVoiceApi(talk.message, apiKey, voice);
  const url = ttsVoice.audio;

  if (!url) {
    throw new Error("No audio URL returned from synthesis API");
  }

  const resAudio = await fetch(url);
  const buffer = await resAudio.arrayBuffer();
  return buffer;
};
