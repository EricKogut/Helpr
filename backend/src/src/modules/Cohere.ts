import cohere from 'cohere-ai';

const apiKey = process.env.COHERE_KEY;
cohere.init(`${apiKey}`);

const examples = [
  // Positive statements
  { text: 'Practicing mindfulness has improved my mood', label: 'positive' },
  { text: 'Talking to my friends makes me feel supported', label: 'positive' },
  { text: 'I had a productive therapy session today', label: 'positive' },
  {
    text: 'I am proud of myself for taking small steps towards recovery',
    label: 'positive',
  },
  { text: 'I feel grateful for the little joys in life', label: 'positive' },

  // Negative statements
  {
    text: 'I feel overwhelmed and unable to cope with stress',
    label: 'negative',
  },
  {
    text: 'My anxiety is making it hard to focus on anything',
    label: 'negative',
  },
  {
    text: "I can't seem to find joy in things I used to love",
    label: 'negative',
  },
  { text: 'I feel isolated and lonely', label: 'negative' },
  { text: 'I want to give up on everything', label: 'negative' },

  // Neutral statements
  { text: 'Today was a regular day with ups and downs', label: 'neutral' },
  { text: 'I had a mix of emotions but managed them well', label: 'neutral' },
  {
    text: 'I need to take care of myself and prioritize self-care',
    label: 'neutral',
  },
  {
    text: 'I am trying to stay positive despite the challenges',
    label: 'neutral',
  },
  {
    text: 'I made some progress in my mental health journey',
    label: 'neutral',
  },
];

export const classifyMentalHealthInputs = async (inputs: string[]) => {
  const response = await cohere.classify({
    inputs: inputs,
    examples: examples,
  });

  // Calculate the normalized score for each input
  const normalizedScores = response.body.classifications.map(
    (classification) => {
      const confidences = classification.labels;
      return confidences;
    }
  );

  
  return normalizedScores;
};

export default classifyMentalHealthInputs;
