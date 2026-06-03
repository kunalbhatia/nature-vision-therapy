import React from "react";

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

