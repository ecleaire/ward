import test from 'node:test';
import assert from 'node:assert/strict';
import { ERROR_TERMS, ERROR_EXERCISES } from '../src/error-terms';
import { makeCodeSession } from '../src/code-exercises';

for (const mode of ['pybricks', 'godot'] as const) {
  test(`${mode}のエラー8語に読み方・意味・コードと四択3種類がある`, () => {
    const terms = ERROR_TERMS[mode];
    assert.equal(terms.length, 8);
    assert.equal(new Set(terms.map(term => term.word)).size, 8);
    const questions = ERROR_EXERCISES[mode];
    assert.equal(questions.length, 24);
    assert.equal(new Set(questions.map(item => item.id)).size, 24);
    for (const term of terms) {
      for (const value of [term.word, term.reading, term.meaning, term.note, term.context, term.code, term.correctedCode]) assert.ok(value.trim());
      assert.equal(new Set([term.word, ...term.alternatives]).size, 4);
      assert.ok(term.alternatives.every(word => terms.some(item => item.word === word)));
      const items = questions.filter(item => item.errorTerm?.word === term.word);
      assert.equal(items.length, 3);
      for (const item of items) {
        assert.equal(new Set(item.choices.map(choice => choice.text)).size, 4);
        const correct = item.choices.find(choice => choice.id === item.correctId)!;
        assert.equal(correct.text, item.kind === 'reading' ? term.reading : item.kind === 'meaning' ? term.meaning : term.word);
      }
    }
  });
  test(`${mode}のエラー名5問に読み方・意味・コード判定が入り、再挑戦で直前の5問を避ける`, () => {
    const pool = ERROR_EXERCISES[mode];
    for (let run = 0; run < 20; run++) {
      const first = makeCodeSession(mode, [], pool);
      const next = makeCodeSession(mode, first.map(item => item.id), pool);
      for (const session of [first, next]) {
        assert.equal(session.length, 5);
        assert.equal(new Set(session.map(item => item.id)).size, 5);
        assert.deepEqual(new Set(session.map(item => item.kind)), new Set(['reading', 'meaning', 'identify']));
      }
      assert.ok(next.every(item => !first.some(previous => previous.id === item.id)));
    }
  });
}
