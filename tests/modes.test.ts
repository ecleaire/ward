import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGS, MODE_KEY, readMode } from '../src/catalog';
import { GODOT_TERMS } from '../src/godot-terms';
import { EMPTY_PROGRESS, exportProgress, parseProgress, readProgress, writeProgress } from '../src/progress';
import { makeQuiz } from '../src/quiz';

test('Godot 2Dの80語にはノード名・var・const・関数と有効なカテゴリーがある', () => {
  assert.equal(GODOT_TERMS.length, 80);
  assert.equal(new Set(GODOT_TERMS.map(term => term.word)).size, 80);
  for (const word of ['var', 'const', 'func', 'Node2D', 'Sprite2D', 'CharacterBody2D', '_ready', '_process', '_physics_process', 'move_and_slide', 'velocity']) {
    assert.ok(GODOT_TERMS.some(term => term.word === word), word);
  }
  for (const term of GODOT_TERMS) {
    assert.ok(CATALOGS.godot.categories.includes(term.category));
    for (const field of Object.values(term)) assert.ok(field.trim());
  }
});

test('Godotの出題と誤答候補はGodot内から選び、直近20問を避ける', () => {
  const recent = GODOT_TERMS.slice(0, 20).map(term => term.word);
  const meanings = new Set(GODOT_TERMS.map(term => term.meaning));
  for (let run = 0; run < 20; run++) {
    const quiz = makeQuiz(recent, GODOT_TERMS);
    assert.equal(new Set(quiz.map(item => item.term.word)).size, 5);
    for (const item of quiz) {
      assert.ok(!recent.includes(item.term.word));
      assert.equal(new Set(item.choices).size, 4);
      assert.ok(item.choices.includes(item.term.meaning));
      for (const choice of item.choices) assert.ok(meanings.has(choice));
    }
  }
});

test('共通の単語でも履歴を混ぜず、従来のPybricksキーを保持する', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  const pybricks = { known: ['position'], saved: ['return'], quizHistory: ['motor'], speechRate: 'slow' as const };
  const godot = { known: ['return'], saved: ['position'], quizHistory: ['var'], speechRate: 'normal' as const };
  writeProgress(storage, pybricks);
  const original = new Map(values);
  writeProgress(storage, godot, 'godot');
  assert.deepEqual(readProgress(storage), pybricks);
  assert.deepEqual(readProgress(storage, 'godot'), godot);
  for (const [key, value] of original) assert.equal(values.get(key), value);
  assert.equal(readMode(storage), 'pybricks');
  storage.setItem(MODE_KEY, 'godot'); assert.equal(readMode(storage), 'godot');
  storage.setItem(MODE_KEY, 'invalid'); assert.equal(readMode(storage), 'pybricks');
});

test('モードを含む履歴が往復し、異なるモードへの取込を拒否する', () => {
  const godot = { ...EMPTY_PROGRESS, known: ['var', 'position'], saved: ['Node2D'], speechRate: 'slow' as const };
  const backup = JSON.parse(exportProgress(godot, 'godot'));
  assert.equal(backup.mode, 'godot');
  assert.deepEqual(parseProgress(backup, 'godot'), godot);
  assert.throws(() => parseProgress(backup), /Godotモード/);
  assert.throws(() => parseProgress({ ...EMPTY_PROGRESS, known: ['return'] }, 'godot'), /Pybricksモード/);
  assert.deepEqual(parseProgress({ ...EMPTY_PROGRESS, known: ['return'] }), { ...EMPTY_PROGRESS, known: ['return'] });
  assert.throws(() => parseProgress({ ...EMPTY_PROGRESS, mode: 'other' }), /モード/);
});
