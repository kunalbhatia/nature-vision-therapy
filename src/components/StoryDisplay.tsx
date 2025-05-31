import React from 'react';

const getColoredText = (text: string) => {
  if (!text) return '';

  const chars = text.split('');
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

  const coloredChar = ({ char, index, pinkSet }: ColoredCharProps): React.ReactNode => {
    if (char.trim() === '') return char;
    let colorClass = '';
    if (pinkSet.has(index)) {
      colorClass = 'text-pinkCustom';
    } else {
      colorClass = Math.random() < 0.5 ? 'text-red-500' : 'text-blue-500';
    }
    return (
      <span key={index} className={colorClass}>
        {char}
      </span>
    );
  };

  return chars.map((char: string, i: number) => coloredChar({ char, index: i, pinkSet }));
};
type StoryDisplayProps = {
  readonly story: { content: string } | null;
  readonly fontSize: number;
  readonly isLoading: boolean;
};
export default function StoryDisplay({ story, fontSize, isLoading }: StoryDisplayProps) {
  return (
    <p className='leading-relaxed break-words' style={{ fontSize: `${fontSize}rem` }}>
      {isLoading ? <span className='text-gray-500'>Loading story...</span> : null}
      {story?.content && getColoredText(story.content)}
      {!story?.content && !isLoading && (
        <span className='text-gray-500'>Please select a story topic to generate story.</span>
      )}
    </p>
  );
}
