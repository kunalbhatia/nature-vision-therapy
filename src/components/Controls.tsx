// src/components/Controls.tsx

type ControlsProps = {
  readonly onTopicSelect: (topic: string) => void;
  readonly fontSize: number;
  readonly setFontSize: (size: number) => void;
};
const storyTopics = [
  "Moral Story",
  "Fairy Story",
  "Folk Tale",
  "Science Fiction",
  "Mystery",
  "Historical Fiction",
  "Inspirational",
  "Magic",
  "Friendship",
  "Family",
  "Courage",
  "Kindness",
];
function Controls({ onTopicSelect, fontSize, setFontSize }: ControlsProps) {
  const toggleFullscreen = () => {
    const doc = document.documentElement;
    if (!document.fullscreenElement) doc.requestFullscreen();
    else document.exitFullscreen();
  };
  return (
    <div className="flex flex-wrap justify-between items-center gap-8 mb-4 flex-col">
      <div className="flex space-x-4">
        <div className="tooltip" data-tip="Decrease font size">
          <button
            data-testid="decrease-font-button"
            onClick={() => setFontSize(Math.max(1.2, fontSize - 0.2))}
            className="bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-full"
          >
            −
          </button>
        </div>
        <div className="tooltip" data-tip="Increase font size">
          <button
            data-testid="increase-font-button"
            onClick={() => setFontSize(fontSize + 0.2)}
            className="bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-full"
          >
            +
          </button>
        </div>

        <div className="tooltip" data-tip="Toggle fullscreen">
          <button
            data-testid="fullscreen-button"
            onClick={toggleFullscreen}
            className="bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-full"
          >
            ⛶
          </button>
        </div>
      </div>
      <div className="flex space-x-4">
        <select
          data-testid="topic-select"
          onChange={(e) => {
            if (e.target.value) {
              onTopicSelect(e.target.value);
            }
          }}
          className="bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-lg"
        >
          <option data-testid="default-option" value="">
            Select a story topic
          </option>
          {storyTopics.map((story) => (
            <option
              data-testid={`option-${story.toLocaleLowerCase()}`}
              key={story.toLocaleLowerCase()}
              value={story.toLocaleLowerCase()}
            >
              {story}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Controls;
