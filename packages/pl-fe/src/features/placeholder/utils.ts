const PLACEHOLDER_CHAR = '█';

const generateText = (length: number) => {
  let text = '';

  for (let i = 0; i < length; i++) {
    text += PLACEHOLDER_CHAR;
  }

  return text;
};

// https://stackoverflow.com/a/7228322/8811886
const randomIntFromInterval = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export { generateText, randomIntFromInterval };
