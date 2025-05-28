import  { useEffect, useState } from 'react';
import StoryDisplay from './components/StoryDisplay';
import Controls from './components/Controls';
import './index.css';
function App() {
  const [stories, setStories] = useState<{ id: string; title: string; content: string }[]>([]);
  const [selectedStory, setSelectedStory] = useState<{ id: string; title: string; content: string } | null>(null);
  const [fontSize, setFontSize] = useState(2);

  useEffect(() => {
    fetch('./stories.json')
      .then(res => res.json())
      .then(setStories)
      .catch(err => console.error('Failed to load stories:', err));
  }, []);

  return (
    <div className="bg-emerald-500 min-h-screen flex flex-col items-center p-6">
      <div className="min-h-fit bg-black text-white flex flex-col items-center justify-start p-6 shadow-lg rounded-md w-full">

        <Controls
          stories={stories}
          onStorySelect={setSelectedStory}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />
        <StoryDisplay story={selectedStory ? { content: selectedStory.content } : null} fontSize={fontSize} />
      </div>
    </div>
  );
}

export default App;
