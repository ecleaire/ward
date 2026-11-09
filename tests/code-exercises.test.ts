import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGS } from '../src/catalog';
import { CODE_EXERCISES, makeCodeSession } from '../src/code-exercises';

for (const mode of ['pybricks', 'godot'] as const) {
  test(`${mode}の診断問題は12問・四択で、正解と修正コード・解説を持つ`, () => {
    const questions = CODE_EXERCISES[mode];
    assert.equal(questions.length, 12);
    assert.equal(new Set(questions.map(item => item.id)).size, 12);
    const words = new Set(CATALOGS[mode].terms.map(term => term.word));
    for (const item of questions) {
      for (const value of [item.title, item.context, item.prompt, item.code, item.error, item.correctedCode, item.explanation]) assert.ok(value.trim());
      assert.equal(item.choices.length, 4);
      assert.equal(new Set(item.choices.map(choice => choice.text)).size, 4);
      assert.equal(item.choices.filter(choice => choice.id === item.correctId).length, 1);
      if (item.kind === 'fix') assert.equal(item.choices.find(choice => choice.id === item.correctId)?.text, item.correctedCode);
      for (const word of item.related) assert.ok(words.has(word), word);
    }
  });
  test(`${mode}の5問は原因と書き直しを含み、直前の5問を避ける`, () => {
    for (let run = 0; run < 30; run++) {
      const first = makeCodeSession(mode);
      const recent = first.map(item => item.id);
      const next = makeCodeSession(mode, recent);
      for (const session of [first, next]) {
        assert.equal(session.length, 5);
        assert.equal(new Set(session.map(item => item.id)).size, 5);
        assert.ok(session.some(item => item.kind === 'fix'));
        assert.ok(session.some(item => item.kind === 'cause'));
        for (const item of session) assert.ok(CODE_EXERCISES[mode].some(source => source.id === item.id));
      }
      assert.ok(next.every(item => !recent.includes(item.id)));
    }
  });
  test(`${mode}の間違えた問題だけを1問でも復習できる`, () => {
    const wrong = [CODE_EXERCISES[mode][2]];
    const review = makeCodeSession(mode, [], wrong);
    assert.equal(review.length, 1);
    assert.equal(review[0].id, wrong[0].id);
    assert.deepEqual(new Set(review[0].choices.map(choice => choice.id)), new Set(wrong[0].choices.map(choice => choice.id)));
  });
}
