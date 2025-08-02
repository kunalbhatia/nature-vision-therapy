import { useState } from 'react';
import StoryDisplay from './components/StoryDisplay';
import Controls from './components/Controls';
import './index.css';
import StoryGenerator from './components/StoryGenerator';
function App() {
  const [fontSize, setFontSize] = useState(1.5);
  const [selectedStory, setSelectedStory] = useState<{ content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleTopicSelect = (topic: string) => {
    setIsLoading(true);
    setSelectedStory(null);
    StoryGenerator({ topic })
      .then(story => {
        setSelectedStory({ content: story });
      })
      .catch(error => {
        console.error('Error generating story:', error);
        setSelectedStory({ content: 'Failed to generate story.' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <div
      className='bg-emerald-500 min-h-screen flex flex-col items-center p-6'
      style={{ backgroundImage: 'url(./trees.png)', backgroundSize: 'cover' }}
    >
      <h1 className='text-2xl font-bold mb-4 text-green-900 bg-green-500 bg-opacity-50 backdrop-blur-md rounded-md p-2'>
        Nature Theme Vision Therapy
      </h1>
      <hr className='w-full mb-6 border-t-4 border-green-600 ' />
      <div className='min-h-fit bg-black text-white flex flex-col items-center justify-start p-6 shadow-lg rounded-md w-full'>
        <Controls onTopicSelect={handleTopicSelect} fontSize={fontSize} setFontSize={setFontSize} />
        <StoryDisplay
          isLoading={isLoading}
          story={selectedStory ? { content: selectedStory.content } : null}
          fontSize={fontSize}
        />
      </div>
    </div>
  );
}

export default App;
