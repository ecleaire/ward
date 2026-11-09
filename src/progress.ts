import { TERMS } from './terms';

export type SpeechRate = 'normal' | 'slow';
export type Progress = { known: string[]; saved: string[]; quizHistory: string[]; speechRate: SpeechRate };
export const EMPTY_PROGRESS: Progress = { known: [], saved: [], quizHistory: [], speechRate: 'normal' };
export const KEYS = { known: 'pybricks-known', saved: 'pybricks-saved', quizHistory: 'pybricks-quiz-history', speechRate: 'pybricks-speech-rate' } as const;
const vocabulary = new Set(TERMS.map(term => term.word));

function wordList(value: unknown, unique: boolean): string[] {
  if (!Array.isArray(value) || !value.every(word => typeof word === 'string')) throw new Error('単語の履歴は文字列の配列にしてください。');
  const words = value.filter(word => vocabulary.has(word));
  return unique ? [...new Set(words)] : words.slice(-20);
}

export function parseProgress(input: unknown): Progress {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('学習データの形式が正しくありません。');
  const data = input as Record<string, unknown>;
  if ('version' in data && data.version !== 1) throw new Error('このバージョンの学習データには対応していません。');
  if ('app' in data && data.app !== 'pybricks-word-lab') throw new Error('Word Labの学習データを選んでください。');
  const legacy = KEYS.known in data;
  const value = (key: keyof Progress): unknown => {
    const raw = data[legacy ? KEYS[key] : key];
    if (legacy && key !== 'speechRate' && typeof raw === 'string') return JSON.parse(raw);
    return raw;
  };
  const rate = value('speechRate');
  if (rate !== 'normal' && rate !== 'slow') throw new Error('発音速度の値が正しくありません。');
  return { known: wordList(value('known'), true), saved: wordList(value('saved'), true), quizHistory: wordList(value('quizHistory'), false), speechRate: rate };
}

export function readProgress(storage: Pick<Storage, 'getItem'>): Progress {
  const result = { ...EMPTY_PROGRESS };
  // 一つのキーが破損しても、ほかの履歴を保持する。
  for (const key of ['known', 'saved', 'quizHistory'] as const) {
    try { result[key] = wordList(JSON.parse(storage.getItem(KEYS[key]) || '[]'), key !== 'quizHistory'); } catch { /* Keep default. */ }
  }
  result.speechRate = storage.getItem(KEYS.speechRate) === 'slow' ? 'slow' : 'normal';
  return result;
}

export function writeProgress(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, data: Progress) {
  const previous = Object.values(KEYS).map(key => [key, storage.getItem(key)] as const);
  try {
    storage.setItem(KEYS.known, JSON.stringify(data.known));
    storage.setItem(KEYS.saved, JSON.stringify(data.saved));
    storage.setItem(KEYS.quizHistory, JSON.stringify(data.quizHistory));
    storage.setItem(KEYS.speechRate, data.speechRate);
  } catch (error) {
    for (const [key, value] of previous) {
      try { if (value === null) storage.removeItem(key); else storage.setItem(key, value); } catch { /* Best effort rollback. */ }
    }
    throw error;
  }
}

export function exportProgress(data: Progress) {
  return JSON.stringify({ app: 'pybricks-word-lab', version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2);
}

export function mergeProgress(current: Progress, incoming: Progress): Progress {
  return { known: [...new Set([...current.known, ...incoming.known])], saved: [...new Set([...current.saved, ...incoming.saved])], quizHistory: [...current.quizHistory, ...incoming.quizHistory].slice(-20), speechRate: incoming.speechRate };
}
