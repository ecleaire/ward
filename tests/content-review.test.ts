import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGS } from '../src/catalog';
import { ERROR_TERMS, ERROR_EXERCISES } from '../src/error-terms';
import { CODE_EXERCISES } from '../src/code-exercises';
import { speechText } from '../src/speech';
import { quizChoices, meaningsOverlap } from '../src/quiz';

test('identifier speech separates words, abbreviations and dimensions', () => {
  for (const [input, expected] of Object.entries({
    _physics_process: 'physics process', '@onready': 'on ready',
    CharacterBody2D: 'Character Body two D', GPUParticles2D: 'G P U particles two D',
    SyntaxError: 'Syntax Error', ZeroDivisionError: 'Zero Division Error',
    IMU: 'I M U', HSV: 'H S V', PID: 'P I D', Vector2: 'vector two', torque: 'torque',
  })) assert.equal(speechText(input), expected);
  for (const mode of ['pybricks', 'godot'] as const) {
    for (const term of [...CATALOGS[mode].terms, ...ERROR_TERMS[mode]]) {
      assert.match(speechText(term.word), /^[a-zA-Z ]+$/);
    }
  }
});

test('all questions have one distinct answer and complete learning material', () => {
  for (const mode of ['pybricks', 'godot'] as const) {
    for (const q of [...CODE_EXERCISES[mode], ...ERROR_EXERCISES[mode]]) {
      assert.equal(q.choices.length, 4, q.id);
      assert.equal(new Set(q.choices.map(c => c.text)).size, 4, q.id);
      assert.equal(q.choices.filter(c => c.id === q.correctId).length, 1, q.id);
      for (const text of [q.context, q.prompt, q.correctedCode, q.explanation]) assert.ok(text.trim(), q.id);
    }
  }
});

test('all 240 vocabulary entries have four distinct, non-overlapping answer options', () => {
  for (const mode of ['pybricks', 'godot'] as const) {
    const terms = CATALOGS[mode].terms;
    for (const term of terms) {
      const choices = quizChoices(term, terms);
      assert.equal(new Set(choices).size, 4, term.word);
      assert.equal(choices.filter(choice => choice === term.meaning).length, 1);
      for (const other of terms.filter(other => other.word !== term.word && meaningsOverlap(term.word, other.word))) {
        assert.ok(!choices.includes(other.meaning), `${term.word}: ${other.word}`);
      }
    }
  }
});
