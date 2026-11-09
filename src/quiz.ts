import { TERMS } from './terms';

export function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function makeQuiz(recentWords: string[] = []) {
  const fresh = TERMS.filter(term => !recentWords.slice(-20).includes(term.word));
  return shuffle(fresh.length >= 5 ? fresh : TERMS).slice(0, 5).map(term => {
    const otherMeanings = TERMS.filter(item => item.meaning !== term.meaning).map(item => item.meaning);
    const distractors = shuffle([...new Set(otherMeanings)]).slice(0, 3);
    return { term, choices: shuffle([term.meaning, ...distractors]) };
  });
}
export type QuizItem = ReturnType<typeof makeQuiz>[number];
