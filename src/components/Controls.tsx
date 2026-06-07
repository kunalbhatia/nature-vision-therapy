// src/components/Controls.tsx

import { FaVolumeUp, FaVolumeMute, FaPause, FaPlay } from 'react-icons/fa';

type ControlsProps = {
  readonly onTopicSelect: (topic: string) => void;
  readonly fontSize: number;
  readonly setFontSize: (size: number) => void;
  readonly isSpeaking: boolean;
  readonly isPaused: boolean;
  readonly handleSpeak: () => void;
  readonly handlePause: () => void;
  readonly handleStop: () => void;
  readonly hasStory: boolean;
  readonly userLevel: number;
};

const storyTopics = [
  { name: "Moral Story", level: 1 },
  { name: "Fairy Story", level: 1 },
  { name: "Folk Tale", level: 1 },
  { name: "Friendship", level: 1 },
  { name: "Family", level: 1 },
  { name: "Kindness", level: 1 },
  { name: "Inspirational", level: 2 },
  { name: "Courage", level: 2 },
  { name: "Magic", level: 2 },
  { name: "Fantasy", level: 2 },
  { name: "Science Fiction", level: 3 },
  { name: "Space", level: 3 },
  { name: "Mystery", level: 3 },
  { name: "Historical Fiction", level: 3 },
];

function Controls({
  onTopicSelect,
  fontSize,
  setFontSize,
  isSpeaking,
  isPaused,
  handleSpeak,
  handlePause,
  handleStop,
  hasStory,
  userLevel,
}: ControlsProps) {
  const toggleFullscreen = () => {
    const doc = document.documentElement;
    if (!document.fullscreenElement) doc.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-8 mb-4 flex-col">
      <div className="flex space-x-4 items-center">
        <div className="tooltip" data-tip="Decrease font size">
          <button
            onClick={() => setFontSize(Math.max(1.2, fontSize - 0.2))}
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold rounded-full flex items-center justify-center transition-colors"
          >
            −
          </button>
        </div>
        <div className="tooltip" data-tip="Increase font size">
          <button
            onClick={() => setFontSize(fontSize + 0.2)}
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold rounded-full flex items-center justify-center transition-colors"
          >
            +
          </button>
        </div>

        <div className="tooltip" data-tip="Toggle fullscreen">
          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold rounded-full flex items-center justify-center transition-colors"
          >
            ⛶
          </button>
        </div>

        {hasStory && (
          <>
            {!isSpeaking && !isPaused ? (
              <div className="tooltip" data-tip="Read Aloud">
                <button
                  onClick={handleSpeak}
                  className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold rounded-full flex items-center justify-center transition-colors"
                >
                  <FaVolumeUp />
                </button>
              </div>
            ) : (
              <>
                {isSpeaking ? (
                  <div className="tooltip" data-tip="Pause">
                    <button
                      onClick={handlePause}
                      className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold rounded-full flex items-center justify-center transition-colors"
                    >
                      <FaPause />
                    </button>
                  </div>
                ) : (
                  <div className="tooltip" data-tip="Resume">
                    <button
                      onClick={handleSpeak}
                      className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold rounded-full flex items-center justify-center transition-colors"
                    >
                      <FaPlay />
                    </button>
                  </div>
                )}
                <div className="tooltip" data-tip="Stop">
                  <button
                    onClick={handleStop}
                    className="w-12 h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full flex items-center justify-center transition-colors"
                  >
                    <FaVolumeMute />
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col items-center gap-2">
        <select
          onChange={(e) => {
            if (e.target.value) {
              onTopicSelect(e.target.value);
            }
          }}
          className="bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-lg outline-none cursor-pointer"
        >
          <option value="">Select a story topic</option>
          {storyTopics.map((topic) => {
            const isLocked = userLevel < topic.level;
            return (
              <option
                key={topic.name.toLocaleLowerCase()}
                value={topic.name.toLocaleLowerCase()}
                disabled={isLocked}
                className={isLocked ? "bg-gray-300 text-gray-500" : ""}
              >
                {topic.name} {isLocked ? `(Locked - Level ${topic.level})` : ""}
              </option>
            );
          })}
        </select>
        {userLevel < 3 && (
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
            Level up your &quot;Vision Power&quot; to unlock more themes!
          </p>
        )}
      </div>
    </div>
  );
}

export default Controls;
