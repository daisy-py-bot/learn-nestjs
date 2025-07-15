export type QuizQuestion = {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
};

export type QuizResponse = {
  questionId: string;
  selectedOptionIds: string[];
  answerText?: string;
};