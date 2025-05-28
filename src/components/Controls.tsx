type ControlsProps = {
  readonly stories: ReadonlyArray<{ id: string; title: string; content: string }>;
  readonly onStorySelect: (story: { id: string; title: string; content: string }) => void;
  readonly fontSize: number;
  readonly setFontSize: (size: number) => void;
};
function Controls({ stories, onStorySelect, fontSize, setFontSize }: ControlsProps) {
  const toggleFullscreen = () => {
    const doc = document.documentElement;
    if (!document.fullscreenElement) doc.requestFullscreen();
    else document.exitFullscreen();
  };
  return (
    <div className='flex flex-wrap justify-between items-center gap-8 mb-4'>
      <div className='flex space-x-4'>
        <div className='tooltip' data-tip='Decrease font size'>
          <button
            onClick={() => setFontSize(Math.max(1.2, fontSize - 0.2))}
            className='bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-full'
          >
            −
          </button>
        </div>
        <div className='tooltip' data-tip='Increase font size'>
          <button
            onClick={() => setFontSize(fontSize + 0.2)}
            className='bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-full'
          >
            +
          </button>
        </div>
      </div>

      <select
        onChange={e => {
          const selectedStory = stories.find(s => s.id === e.target.value);
          if (selectedStory) onStorySelect(selectedStory);
        }}
        className='bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-lg'
      >
        <option value=''>Select a story</option>
        {stories.map(story => (
          <option key={story.id} value={story.id}>
            {story.title}
          </option>
        ))}
      </select>
      <div className='tooltip' data-tip='Toggle fullscreen'>
        <button
          onClick={toggleFullscreen}
          className='bg-emerald-500 hover:bg-emerald-400 text-green-900 font-bold py-2 px-4 rounded-full'
        >
          ⛶
        </button>
      </div>
    </div>
  );
}

export default Controls;
