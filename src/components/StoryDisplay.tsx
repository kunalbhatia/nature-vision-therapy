import React, { useState, useEffect, useRef } from "react";
import { FaVolumeUp, FaVolumeMute, FaPause, FaPlay } from "react-icons/fa";

const getColoredText = (text: string) => {
  if (!text) return "";

  const chars = text.split("");
  const total = chars.length;
  const indices = [...Array(total).keys()];

  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const pinkSet = new Set(indices.slice(0, Math.floor(total * 0.6)));

  interface ColoredCharProps {
    char: string;
    index: number;
    pinkSet: Set<number>;
  }

  const coloredChar = ({
    char,
    index,
    pinkSet,
  }: ColoredCharProps): React.ReactNode => {
    if (char.trim() === "") return char;
    let colorClass = "";
    if (pinkSet.has(index)) {
      colorClass = "text-pinkCustom";
    } else {
      colorClass = Math.random() < 0.5 ? "text-red-500" : "text-blue-500";
    }
    return (
      <span key={index} className={colorClass}>
        {char}
      </span>
    );
  };

  return chars.map((char: string, i: number) =>
    coloredChar({ char, index: i, pinkSet }),
  );
};
type StoryDisplayProps = {
  readonly story: { content: string } | null;
  readonly fontSize: number;
  readonly isLoading: boolean;
};
export default function StoryDisplay({
  story,
  fontSize,
  isLoading,
}: StoryDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!story?.content || !synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(story.content);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    // Choose a friendly voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-GB')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 0.9; // Slightly slower for kids
    utterance.pitch = 1.1; // Slightly higher/friendlier

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

  const renderedContent = story?.content ? getColoredText(story.content) : null;

  if (story?.content === null || (!story && isLoading)) {
    return (
      <>
        <p className="text-gray-500">Loading your story...</p>
        <br />
      </>
    );
  }

  if (!story?.content && !isLoading) {
    return (
      <p className="text-gray-500">
        Please select a story topic to generate story.
      </p>
    );
  }

  if (renderedContent) {
    return (
      <div className="w-full flex flex-col gap-4">
        <div className="flex justify-end gap-2 px-4">
          {!isSpeaking && !isPaused ? (
            <button onClick={handleSpeak} className="btn btn-circle btn-sm btn-ghost text-white hover:bg-white/20" title="Read Aloud">
              <FaVolumeUp />
            </button>
          ) : (
            <>
              {isSpeaking ? (
                <button onClick={handlePause} className="btn btn-circle btn-sm btn-ghost text-white hover:bg-white/20" title="Pause">
                  <FaPause />
                </button>
              ) : (
                <button onClick={handleSpeak} className="btn btn-circle btn-sm btn-ghost text-white hover:bg-white/20" title="Resume">
                  <FaPlay />
                </button>
              )}
              <button onClick={handleStop} className="btn btn-circle btn-sm btn-ghost text-red-500 hover:bg-white/20" title="Stop">
                <FaVolumeMute />
              </button>
            </>
          )}
        </div>
        <div
          className="mx-auto p-4 rounded-md shadow-md bg-black overflow-y-auto w-full"
          style={{
            height: "min(65vh, 1024px)",
            fontSize: `${fontSize}rem`,
          }}
        >
          <p className="text-left whitespace-pre-wrap">{renderedContent}</p>
        </div>
      </div>
    );
  }

  return null;
}

