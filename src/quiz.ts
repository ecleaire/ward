import { TERMS, type Term } from './terms';

export function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

// Avoid plausible alternative translations of the same word, not just exact duplicates.
const overlappingMeanings = [
  ['angle', 'position', 'rotation', 'heading', 'orientation'],
  ['speed', 'velocity', 'turn rate', 'angular velocity'],
  ['torque', 'load', 'force'], ['sample', 'measurement'],
  ['function', 'method'], ['argument', 'parameter'],
  ['calibration', 'calibrated'], ['rotation sensor', 'encoder'],
  ['duty cycle', 'duty limit'], ['stop', 'coast', 'brake', 'hold'],
  ['animation', 'play', 'AnimationPlayer', 'AnimatedSprite2D'],
  ['position', 'global_position'], ['CollisionShape2D', 'CollisionPolygon2D'],
  ['Node', 'Node2D'], ['Container', 'VBoxContainer', 'HBoxContainer', 'MarginContainer'],
];
export function meaningsOverlap(left: string, right: string) {
  return left === right || overlappingMeanings.some(group => group.includes(left) && group.includes(right));
}

export function quizChoices(term: Term, terms: Term[]) {
  const otherMeanings = terms.filter(item => item.meaning !== term.meaning && !meaningsOverlap(term.word, item.word)).map(item => item.meaning);
  return shuffle([term.meaning, ...shuffle([...new Set(otherMeanings)]).slice(0, 3)]);
}

export function makeQuiz(recentWords: string[] = [], terms: Term[] = TERMS) {
  const fresh = terms.filter(term => !recentWords.slice(-20).includes(term.word));
  return shuffle(fresh.length >= 5 ? fresh : terms).slice(0, 5).map(term => ({ term, choices: quizChoices(term, terms) }));
}
export type QuizItem = ReturnType<typeof makeQuiz>[number];
