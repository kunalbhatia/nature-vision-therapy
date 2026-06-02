import { useState } from "react";
import Controls from "../components/Controls";
import StoryDisplay from "../components/StoryDisplay";
import StoryGenerator from "../components/StoryGenerator";
import { useSnackbar } from "../hooks/Snackbar";
import { usePreloader } from "../hooks/Preloader";

export default function StoriesPage() {
  const { showMessage } = useSnackbar();
  const { showPreloader, hidePreloader } = usePreloader();
  
  const [fontSize, setFontSize] = useState(1.5);
  const [selectedStory, setSelectedStory] = useState<{
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTopicSelect = (topic: string) => {
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
      />
      <StoryDisplay
        isLoading={isLoading}
        story={selectedStory ? { content: selectedStory.content } : null}
        fontSize={fontSize}
      />
    </div>
  );
}
