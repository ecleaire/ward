import { test, expect } from '@playwright/test';
import { CATALOGS } from '../../src/catalog';
import { ERROR_TERMS } from '../../src/error-terms';
import { speechText } from '../../src/speech';

for (const mode of ['pybricks', 'godot'] as const) {
  test(`全単語の表示と英語読み上げ入力 ${mode}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 320, height: 844 });
    await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', { value: {
        cancel() {}, getVoices: () => [],
        speak(utterance: SpeechSynthesisUtterance) {
          (window as unknown as { spoken: string }).spoken = utterance.text;
        },
      } });
    });
    await page.goto('');
    await page.getByLabel('学習モード', { exact: true }).selectOption(mode);
    await page.getByRole('navigation', { name: 'スマホメニュー' }).getByRole('button', { name: '単語リスト', exact: true }).click();
    for (const term of CATALOGS[mode].terms) {
      await page.getByRole('textbox', { name: '単語を検索' }).fill(term.word);
      const row = page.locator('.word-row').filter({ has: page.getByRole('heading', { name: term.word, exact: true }) });
      await expect(row).toContainText(term.reading);
      await expect(row).toContainText(term.meaning);
      await expect(row.locator('code')).toHaveText(term.code);
      await row.getByRole('button', { name: `${term.word}の発音を聞く`, exact: true }).click();
      expect(await page.evaluate(() => (window as unknown as { spoken: string }).spoken)).toBe(speechText(term.word));
    }
    await page.getByRole('navigation', { name: 'スマホメニュー' }).getByRole('button', { name: 'コード診断', exact: true }).click();
    await page.getByRole('button', { name: 'エラー名を学ぶ', exact: true }).click();
    await page.locator('.error-glossary summary').click();
    for (const term of ERROR_TERMS[mode]) {
      const row = page.locator('.error-glossary-row').filter({ has: page.locator('dt', { hasText: term.word }) });
      await expect(row).toContainText(term.reading);
      await row.getByRole('button', { name: `${term.word}の発音を聞く`, exact: true }).click();
      expect(await page.evaluate(() => (window as unknown as { spoken: string }).spoken)).toBe(speechText(term.word));
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
