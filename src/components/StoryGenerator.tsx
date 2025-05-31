import { GoogleGenerativeAI } from '@google/generative-ai';
type StoryGeneratorType = {
  readonly topic: string;
};
export default async function StoryGenerator({ topic }: StoryGeneratorType) {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Write a short ${topic.toLowerCase()} for kids in plain text, directly provide the story without any title.`,
          },
        ],
      },
    ],
  });
  return result.response.text();
}
