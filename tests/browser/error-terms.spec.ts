import { test, expect } from '@playwright/test';
import { ERROR_TERMS, ERROR_EXERCISES } from '../../src/error-terms';

for (const width of [320, 390, 1280]) {
  for (const mode of ['pybricks', 'godot'] as const) {
    test(`エラー名の読み方・意味・コード・一覧・発音 ${mode} ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        Object.defineProperty(window, 'speechSynthesis', { value: { cancel() {}, getVoices: () => [], speak: (utterance: SpeechSynthesisUtterance) => { (window as unknown as { spoken: unknown[] }).spoken = [utterance.text, utterance.lang, utterance.rate]; } } });
      });
      await page.goto('');
      await page.getByLabel('学習モード', { exact: true }).selectOption(mode);
      await page.getByRole('button', { name: 'ゆっくり', exact: true }).click();
      await page.getByRole('navigation', { name: width <= 900 ? 'スマホメニュー' : 'メインメニュー' }).getByRole('button', { name: 'コード診断', exact: true }).click();
      await page.getByRole('button', { name: 'エラー名を学ぶ', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'エラー名を学ぶ', exact: true })).toBeVisible();
      await page.locator('.error-glossary summary').click();
      await expect(page.locator('.error-glossary-row')).toHaveCount(8);
      const first = ERROR_TERMS[mode][0];
      await expect(page.locator('.error-glossary')).toContainText(first.reading);
      await page.locator('.error-glossary').getByRole('button', { name: `${first.word}の発音を聞く`, exact: true }).click();
      const spoken = await page.evaluate(() => (window as unknown as { spoken: unknown[] }).spoken);
      expect(spoken[0]).toBe(first.word); expect(spoken[1]).toBe('en-US'); expect(spoken[2]).toBeCloseTo(0.65);
      await page.locator('.error-glossary summary').click();
      const kinds: string[] = [];
      for (let index = 0; index < 5; index++) {
        const id = await page.locator('.debug-question').getAttribute('data-question-id');
        const question = ERROR_EXERCISES[mode].find(item => item.id === id)!;
        expect(question).toBeTruthy(); kinds.push(question.kind);
        if (question.kind === 'reading' || question.kind === 'meaning') {
          await expect(page.getByLabel('問題のコード', { exact: true })).toHaveCount(0);
          await expect(page.locator('.debug-error')).toHaveCount(0);
          await expect(page.locator('.error-info')).toHaveCount(0);
        } else await expect(page.getByLabel('問題のコード', { exact: true })).toHaveText(question.code);
        await page.locator(`[data-choice-id="${question.correctId}"]`).click();
        await expect(page.locator('.error-info')).toContainText(question.errorTerm!.reading);
        await expect(page.locator('.error-info')).toContainText(question.errorTerm!.meaning);
        await expect(page.locator('.debug-choice:enabled')).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (index === 0) await page.screenshot({ path: `test-results/errors-${mode}-${width}.png`, fullPage: true });
        await page.getByRole('button', { name: index === 4 ? '結果を見る →' : '次の問題へ →' }).click();
      }
      expect(new Set(kinds)).toEqual(new Set(['reading', 'meaning', 'identify']));
      await expect(page.getByLabel('5問中5問正解', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: '別の5問に挑戦', exact: true }).click();
      const next = await page.locator('.debug-question').getAttribute('data-question-id');
      expect(ERROR_EXERCISES[mode].some(item => item.id === next)).toBe(true);
      await page.getByRole('button', { name: 'コードを直す', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'コード診断', exact: true })).toBeVisible();
      await expect(page.locator('.error-info')).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
}
