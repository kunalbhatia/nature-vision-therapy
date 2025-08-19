import { GoogleGenerativeAI } from '@google/generative-ai';

type StoryGeneratorType = {
  readonly topic: string;
};

export default async function StoryGenerator({ topic }: StoryGeneratorType) {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const characterDetails =
    'Characters:\n- Jhalak (born 2017, brave girl, hero of the story)\n- Ruhi (born 2015, Jhalak’s elder sister)\n- Manya (Jhalak’s mother)\n- Kunal (Jhalak’s father)\n- Dhiru (Manya’s brother, Jhalak’s maternal uncle)\n- Adu (Kunal’s father, Jhalak’s grandfather)\n- Badi Mumma (Kunal’s mother, Jhalak’s grandmother)\n- Radhe (Manya’s mother, Jhalak’s nani)\n- Ronu (Jhalak’s cousin brother)';

  const prompt = `Write a short ${topic.toLowerCase()} for kids in plain text (no title), inspired by Indian culture. The hero is always Jhalak (a brave girl), and characters can only be chosen from the list below. The story should be engaging, simple, and suitable for children aged 5-18, in a friendly and encouraging tone. \n${characterDetails}`;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  return result.response.text();
}
