import { MessageInput } from "@/components/messageInput";
import { useState, useEffect, useCallback } from "react";

type Props = {
  isChatProcessing: boolean;
  onChatProcessStart: (text: string) => void;
};

/**
 * Provides text input and voice input functionality.
 *
 * Automatically sends the input when speech recognition is completed,
 * and disables input during the generation of a response.
 *
 */
export const MessageInputContainer = ({
  isChatProcessing,
  onChatProcessStart,
}: Props) => {
  const [userMessage, setUserMessage] = useState("");
  const [speechRecognition, setSpeechRecognition] =
    useState<SpeechRecognition>();
  const [isMicRecording, setIsMicRecording] = useState(false);

  // Handles the results of speech recognition
  const handleRecognitionResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setUserMessage(text);

      // On speech end
      if (event.results[0].isFinal) {
        setUserMessage(text);
        // Start generating a response
        onChatProcessStart(text);
      }
    },
    [onChatProcessStart]
  );

  // Stops on prolonged silence
  const handleRecognitionEnd = useCallback(() => {
    setIsMicRecording(false);
  }, []);

  const handleClickMicButton = useCallback(() => {
    if (isMicRecording) {
      speechRecognition?.abort();
      setIsMicRecording(false);

      return;
    }

    speechRecognition?.start();
    setIsMicRecording(true);
  }, [isMicRecording, speechRecognition]);

  const handleClickSendButton = useCallback(() => {
    onChatProcessStart(userMessage);
  }, [onChatProcessStart, userMessage]);

  useEffect(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    // Fallback for environments like Firefox that do not support SpeechRecognition
    if (!SpeechRecognition) {
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true; // Return interim results during recognition
    recognition.continuous = false; // End recognition on speech end

    recognition.addEventListener("result", handleRecognitionResult);
    recognition.addEventListener("end", handleRecognitionEnd);

    setSpeechRecognition(recognition);
  }, [handleRecognitionResult, handleRecognitionEnd]);

  useEffect(() => {
    if (!isChatProcessing) {
      setUserMessage("");
    }
  }, [isChatProcessing]);

  return (
    <MessageInput
      userMessage={userMessage}
      isChatProcessing={isChatProcessing}
      isMicRecording={isMicRecording}
      onChangeUserMessage={(e) => setUserMessage(e.target.value)}
      onClickMicButton={handleClickMicButton}
      onClickSendButton={handleClickSendButton}
    />
  );
};
