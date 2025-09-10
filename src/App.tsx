import { useState } from 'react';
import StoryDisplay from './components/StoryDisplay';
import Controls from './components/Controls';
import StoryGenerator from './components/StoryGenerator';

import './index.css';
import Navbar from './components/NavBar';

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
      className='min-h-screen flex flex-col items-center'
      style={{
        backgroundImage: 'url(./trees.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Navbar />
      <div className='min-h-fit bg-black text-white flex flex-col items-center justify-start p-6 shadow-lg rounded-md w-full '>
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
