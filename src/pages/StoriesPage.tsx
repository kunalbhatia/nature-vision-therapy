import { useState, useEffect, useRef } from "react";
import Controls from "../components/Controls";
import StoryDisplay from "../components/StoryDisplay";
import StoryGenerator from "../components/StoryGenerator";
import { useSnackbar } from "../hooks/Snackbar";
import { usePreloader } from "../hooks/Preloader";

export default function StoriesPage() {
  const { showMessage } = useSnackbar();
  const { showPreloader, hidePreloader } = usePreloader();
  
  const [fontSize, setFontSize] = useState(1.5);
  const [userLevel, setUserLevel] = useState(1);
  const [selectedStory, setSelectedStory] = useState<{
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Fetch user progress to get Vision Power level
    fetch('/api/get-progress-summary')
      .then(res => res.json())
      .then(data => {
        if (data.level) setUserLevel(data.level);
      })
      .catch(err => console.error('Failed to fetch level:', err));

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!selectedStory?.content || !synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(selectedStory.content);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    const voices = synthRef.current.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.includes("en-IN")) ||
      voices.find((v) => v.lang.includes("en-GB")) ||
      voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utteranceRef.current = utterance;
    synthRef.current.cancel();
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  const handlePause = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const handleTopicSelect = (topic: string) => {
    handleStop();
    setIsLoading(true);
    setSelectedStory(null);
    showPreloader();
    StoryGenerator({ topic })
      .then((story) => {
        setSelectedStory({ content: story });
      })
      .catch((error) => {
        console.error("Error generating story:", error);
        setSelectedStory({ content: "Failed to generate story." });
        showMessage("Failed to generate story", "error");
      })
      .finally(() => {
        setIsLoading(false);
        hidePreloader();
      });
  };

  return (
    <div className="mt-4 w-[98%] min-h-fit bg-black text-white flex flex-col items-center justify-start p-6 shadow-lg rounded-md">
      <Controls
        onTopicSelect={handleTopicSelect}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        handleSpeak={handleSpeak}
        handlePause={handlePause}
        handleStop={handleStop}
        hasStory={selectedStory !== null}
        userLevel={userLevel}
      />
      <StoryDisplay
        isLoading={isLoading}
        story={selectedStory ? { content: selectedStory.content } : null}
        fontSize={fontSize}
      />
    </div>
  );
}
