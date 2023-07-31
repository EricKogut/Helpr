// openAI.js
import { Configuration, OpenAIApi } from 'openai';

const apiKey = process.env.OPEN_AI_KEY;
console.log(apiKey);
const configuration = new Configuration({
  apiKey,
});
const openai = new OpenAIApi(configuration);

export const generateChatResponse = async (prompt: string) => {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 1000,
    });

    return response.data.choices[0]?.text || '';
  } catch (error) {
    console.error('Error generating ChatGPT response:', error);
    throw new Error('Error generating ChatGPT response');
  }
};
