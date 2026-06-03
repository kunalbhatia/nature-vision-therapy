import { GoogleGenerativeAI } from '@google/generative-ai';

type StoryGeneratorType = {
  readonly topic: string;
};

interface ProgressSummary {
  childName: string;
  level: number;
  exercisesCompleted: number;
  streak: number;
}

export default async function StoryGenerator({ topic }: StoryGeneratorType) {
  type Character = {
    name: string;
    birthYear: number;
    relationshipWithMe?: string;
    gender?: string;
  };

  type CharacterDetails = Record<string, Character>;

  let characterDetails: CharacterDetails | string = '';
  let recentTherapy: ProgressSummary | null = null;

  try {
    const [resChars, resProgress] = await Promise.all([
      fetch('/api/get-characters-details', { credentials: 'include' }),
      fetch('/api/get-progress-summary', { credentials: 'include' })
    ]);

    if (resChars.ok) {
      const data = await resChars.json();
      characterDetails = data.characterDetails;
    }
    if (resProgress.ok) {
      recentTherapy = await resProgress.json();
    }
  } catch (error) {
    console.warn('Falling back to alternate details:', error);
    // ...
  }

  function buildDynamicPrompt(basePrompt: string, characterDetails: CharacterDetails, therapy: ProgressSummary | null): string {
    const hero = characterDetails.me;
    if (!hero) throw new Error("Missing 'me' character for hero");

    const formattedCharacters = Object.values(characterDetails)
      .map(({ name, birthYear, relationshipWithMe, gender }) => {
        const relationshipText = relationshipWithMe ? `, ${relationshipWithMe}` : '';
        const genderText = gender ? `, gender: ${gender}` : '';
        return `- ${name} (born ${birthYear}${relationshipText}${genderText})`;
      })
      .join('\n');

    let therapyContext = '';
    if (therapy) {
      therapyContext = `\nContext: ${therapy.childName} has a "Vision Power" Level of ${therapy.level}. 
      They just completed ${therapy.exercisesCompleted} exercises and have a ${therapy.streak}-day streak! 
      Mention their super vision powers in a subtle, encouraging way.`;
    }

    const prompt = `
${basePrompt.trim()}
The hero is always ${hero.name} (a brave ${hero.gender ?? 'child'}, born ${
      hero.birthYear
    }), and characters can only be chosen from the list below.${therapyContext}
Characters:
${formattedCharacters}
  `.trim();

    return prompt;
  }

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const basePrompt = `Write a short ${topic.toLowerCase()} for kids in plain text (no title), inspired by Indian culture. The story should be engaging, simple, and suitable for children aged 5-18, in a friendly and encouraging tone. Avoid complex words and phrases.`;
  let finalPrompt: string | null = null;
  if (typeof characterDetails === 'object') {
    finalPrompt = buildDynamicPrompt(basePrompt, characterDetails, recentTherapy);
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
