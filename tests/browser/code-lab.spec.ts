import { test, expect, type Page } from '@playwright/test';
import { CODE_EXERCISES } from '../../src/code-exercises';
import type { ModeId } from '../../src/catalog';

async function navigate(page: Page, name: string) {
  await page.getByRole('navigation', { name: page.viewportSize()!.width <= 900 ? 'スマホメニュー' : 'メインメニュー' }).getByRole('button', { name, exact: true }).click();
}
async function noOverflow(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }

for (const width of [320, 390, 1280]) {
  for (const mode of ['pybricks', 'godot'] as const) {
    test(`コード診断の採点・修正・間違い復習・モード分離 ${mode} ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(''); await page.getByLabel('学習モード', { exact: true }).selectOption(mode);
      const before = await page.evaluate(() => ['pybricks-known', 'godot-known', 'pybricks-quiz-history', 'godot-quiz-history'].map(key => localStorage.getItem(key)));
      await page.getByRole('button', { name: /直してみる/ }).click();
      await expect(page.getByRole('heading', { name: 'コード診断', exact: true })).toBeVisible();
      const seen: string[] = []; let wrongId = '';
      for (let index = 0; index < 5; index++) {
        const id = (await page.locator('.debug-question').getAttribute('data-question-id'))!;
        expect(seen).not.toContain(id); seen.push(id);
        const question = CODE_EXERCISES[mode].find(item => item.id === id)!; expect(question).toBeTruthy();
        await expect(page.locator('.debug-choice')).toHaveCount(4);
        await expect(page.getByLabel('修正コード', { exact: true })).toHaveCount(0);
        const choiceId = index === 0 ? question.choices.find(choice => choice.id !== question.correctId)!.id : question.correctId;
        if (index === 0) wrongId = id;
        await page.locator(`[data-choice-id="${choiceId}"]`).click();
        await expect(page.getByRole('region', { name: 'コード診断の解説' })).toBeVisible();
        await expect(page.getByLabel('修正コード', { exact: true })).toHaveText(question.correctedCode);
        await expect(page.locator('.debug-feedback')).toContainText(question.explanation);
        await expect(page.locator(`[data-choice-id="${question.correctId}"]`)).toContainText('✓ 正しい答え');
        await expect(page.locator('.debug-choice:enabled')).toHaveCount(0);
        await noOverflow(page);
        if (index === 0) await page.screenshot({ path: `test-results/code-feedback-${mode}-${width}.png`, fullPage: true });
        await page.getByRole('button', { name: index === 4 ? '結果を見る →' : '次の問題へ →' }).click();
      }
      await expect(page.getByLabel('5問中4問正解', { exact: true })).toBeVisible();
      await expect(page.locator('.debug-review details')).toHaveCount(5);
      await expect(page.locator('.debug-review .review-wrong[open]')).toHaveCount(1);
      await noOverflow(page);
      await page.getByRole('button', { name: '間違えた1問を復習', exact: true }).click();
      await expect(page.getByText('第1問 / 1問', { exact: true })).toBeVisible();
      await expect(page.locator('.debug-question')).toHaveAttribute('data-question-id', wrongId);
      const wrong = CODE_EXERCISES[mode].find(item => item.id === wrongId)!;
      await page.locator(`[data-choice-id="${wrong.correctId}"]`).click();
      await page.getByRole('button', { name: '結果を見る →' }).click();
      await expect(page.getByLabel('1問中1問正解', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /間違えた.*問を復習/ })).toHaveCount(0);
      await page.getByRole('button', { name: '別の5問に挑戦', exact: true }).click();
      await expect(page.getByText('第1問 / 5問', { exact: true })).toBeVisible();
      await expect(page.locator('.debug-feedback')).toHaveCount(0);
      expect(await page.locator('.debug-question').getAttribute('data-question-id')).not.toBe(wrongId);
      const after = await page.evaluate(() => ['pybricks-known', 'godot-known', 'pybricks-quiz-history', 'godot-quiz-history'].map(key => localStorage.getItem(key)));
      expect(after).toEqual(before);
      const other: ModeId = mode === 'pybricks' ? 'godot' : 'pybricks';
      await page.getByLabel('学習モード', { exact: true }).selectOption(other);
      await expect(page.locator('.debug-question')).toHaveCount(0);
      await navigate(page, 'コード診断');
      const otherId = await page.locator('.debug-question').getAttribute('data-question-id');
      expect(CODE_EXERCISES[other].some(item => item.id === otherId)).toBe(true);
      await noOverflow(page); expect(errors).toEqual([]);
    });
  }
}
