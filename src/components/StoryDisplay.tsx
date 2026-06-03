import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaStop, FaVolumeUp } from 'react-icons/fa';

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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const renderedContent = story?.content ? getColoredText(story.content) : null;

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    if (story?.content) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(story.content);
      utterance.rate = 0.9; // Slightly slower for children
      utterance.pitch = 1.1; // Slightly higher/friendlier
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

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
        <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
              <FaVolumeUp />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Read Aloud Mode</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">AI Voice Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isSpeaking || isPaused ? (
              <button 
                onClick={handleSpeak}
                className="btn btn-circle btn-sm btn-primary shadow-lg shadow-primary/20"
                title={isPaused ? "Resume" : "Play Story"}
              >
                <FaPlay className="ml-0.5 text-xs" />
              </button>
            ) : (
              <button 
                onClick={handlePause}
                className="btn btn-circle btn-sm btn-warning shadow-lg shadow-warning/20"
                title="Pause"
              >
                <FaPause className="text-xs" />
              </button>
            )}
            <button 
              onClick={handleStop}
              className="btn btn-circle btn-sm btn-error shadow-lg shadow-error/20"
              disabled={!isSpeaking && !isPaused}
              title="Stop"
            >
              <FaStop className="text-xs" />
            </button>
          </div>
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

