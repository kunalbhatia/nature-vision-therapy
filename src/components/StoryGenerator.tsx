import { GoogleGenerativeAI } from '@google/generative-ai';

type StoryGeneratorType = {
  readonly topic: string;
};

export default async function StoryGenerator({ topic }: StoryGeneratorType) {
  type Character = {
    name: string;
    birthYear: number;
    relationshipWithMe?: string;
    gender?: string;
  };

  type CharacterDetails = Record<string, Character>;

  let characterDetails: CharacterDetails | string = '';

  try {
    const res = await fetch('/api/get-characters-details', { credentials: 'include' });

    if (res.ok) {
      const data: { characterDetails: CharacterDetails } = await res.json();
      characterDetails = data.characterDetails;
    } else {
      throw new Error('API not available');
    }
  } catch (error) {
    console.warn('Falling back to alternate character details:', error);

    characterDetails =
      'Characters:\n' +
      '- Jhalak (born 2017, brave girl, hero of the story)\n' +
      '- Ruhi (born 2015, Jhalak’s elder sister)\n' +
      '- Manya (Jhalak’s mother)\n' +
      '- Kunal (Jhalak’s father)\n' +
      '- Dhiru (Manya’s brother, Jhalak’s maternal uncle)\n' +
      '- Adu (Kunal’s father, Jhalak’s grandfather)\n' +
      '- Badi Mumma (Kunal’s mother, Jhalak’s grandmother)\n' +
      '- Radhe (Manya’s mother, Jhalak’s nani)\n' +
      '- Ronu (Jhalak’s cousin brother)';
  }

  function buildDynamicPrompt(basePrompt: string, characterDetails: CharacterDetails): string {
    console.log('Character Details:', characterDetails);
    const hero = characterDetails.me;
    if (!hero) throw new Error("Missing 'me' character for hero");

    const formattedCharacters = Object.values(characterDetails)
      .map(({ name, birthYear, relationshipWithMe, gender }) => {
        const relationshipText = relationshipWithMe ? `, ${relationshipWithMe}` : '';
        const genderText = gender ? `, gender: ${gender}` : '';
        return `- ${name} (born ${birthYear}${relationshipText}${genderText})`;
      })
      .join('\n');

    const prompt = `
${basePrompt.trim()}
The hero is always ${hero.name} (a brave ${hero.gender ?? 'child'}, born ${
      hero.birthYear
    }), and characters can only be chosen from the list below.
Characters:
${formattedCharacters}
  `.trim();

    return prompt;
  }

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const basePrompt = `Write a short ${topic.toLowerCase()} for kids in plain text (no title), inspired by Indian culture. The story should be engaging, simple, and suitable for children aged 5-18, in a friendly and encouraging tone. Avoid complex words and phrases.`;
  let finalPrompt: string | null = null;
  if (typeof characterDetails === 'object') {
    finalPrompt = buildDynamicPrompt(basePrompt, characterDetails);
  } else {
    finalPrompt = `Write a short ${topic.toLowerCase()} for kids in plain text (no title), inspired by Indian culture. The hero is always Jhalak (a brave girl), and characters can only be chosen from the list below. The story should be engaging, simple, and suitable for children aged 5-18, in a friendly and encouraging tone. \n${characterDetails}`;
  }

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: finalPrompt }],
      },
    ],
  });

  return result.response.text();
}
