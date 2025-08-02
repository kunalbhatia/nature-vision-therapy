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
            text: `Write a short ${topic.toLowerCase()} for kids in plain text (no title), inspired by Indian culture, where the hero is always Jhalak (a brave girl), and characters are chosen from [Jhalak, Ruhi, Manya, Kunal, Dhiru, Adu, Badi Mumma, Radhe, Ronu]. The story should be engaging, simple, and suitable for children aged 5-18. Use a friendly and encouraging tone.`,
          },
        ],
      },
    ],
  });
  return result.response.text();
}
