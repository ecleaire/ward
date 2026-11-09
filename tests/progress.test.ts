import test from 'node:test';
import assert from 'node:assert/strict';
import { TERMS } from '../src/terms';
import { makeQuiz } from '../src/quiz';
import { EMPTY_PROGRESS, exportProgress, KEYS, mergeProgress, parseProgress, readProgress, writeProgress } from '../src/progress';

test('90語すべてに学習に必要なデータと一意の識別子がある', () => {
  assert.equal(TERMS.length, 90);
  assert.equal(new Set(TERMS.map(term => term.word)).size, 90);
  for (const term of TERMS) for (const field of Object.values(term)) assert.ok(field.length);
  assert.equal(TERMS.find(term => term.word === 'torque')?.reading, 'トルク');
});

test('5問四択は一意で、直近20問を避ける', () => {
  const recent = TERMS.slice(0, 20).map(term => term.word);
  for (let run = 0; run < 30; run++) {
    const quiz = makeQuiz(recent);
    assert.equal(quiz.length, 5);
    assert.equal(new Set(quiz.map(item => item.term.word)).size, 5);
    for (const item of quiz) {
      assert.ok(!recent.includes(item.term.word));
      assert.equal(new Set(item.choices).size, 4);
      assert.ok(item.choices.includes(item.term.meaning));
    }
  }
});

test('履歴が書き出しと読み込みで往復し、既存履歴と統合される', () => {
  const source = { known: ['motor'], saved: ['torque'], quizHistory: ['hold', 'motor'], speechRate: 'slow' as const };
  assert.deepEqual(parseProgress(JSON.parse(exportProgress(source))), source);
  assert.deepEqual(mergeProgress({ ...source, known: ['angle'], saved: ['motor'] }, source), { ...source, known: ['angle', 'motor'], saved: ['motor', 'torque'], quizHistory: ['hold', 'motor', 'hold', 'motor'] });
});

test('旧localStorage形式を読み込み、不明語と重複を除く', () => {
  const data = parseProgress({ [KEYS.known]: '["motor","motor","missing"]', [KEYS.saved]: '[]', [KEYS.quizHistory]: '[]', [KEYS.speechRate]: 'normal' });
  assert.deepEqual(data, { ...EMPTY_PROGRESS, known: ['motor'] });
});

test('誤った型や別アプリのデータを拒否する', () => {
  for (const data of [null, [], {}, { ...EMPTY_PROGRESS, version: 2 }, { ...EMPTY_PROGRESS, app: 'other' }, { ...EMPTY_PROGRESS, known: [5] }, { ...EMPTY_PROGRESS, speechRate: 'fast' }]) {
    assert.throws(() => parseProgress(data));
  }
});

test('破損キーだけを初期化し、保存失敗時に元データへ戻す', () => {
  const values = new Map<string, string>([[KEYS.known, '{broken'], [KEYS.saved, '["torque"]']]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { if (key === KEYS.speechRate) throw new Error('quota'); values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  assert.deepEqual(readProgress(storage), { ...EMPTY_PROGRESS, saved: ['torque'] });
  assert.throws(() => writeProgress(storage, { ...EMPTY_PROGRESS, known: ['motor'] }));
  assert.equal(storage.getItem(KEYS.known), '{broken');
  assert.equal(storage.getItem(KEYS.saved), '["torque"]');
  assert.equal(storage.getItem(KEYS.quizHistory), null);
});
