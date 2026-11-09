import { test, expect, type Page } from '@playwright/test';
import { GODOT_TERMS } from '../../src/godot-terms';

async function navigate(page: Page, name: string) {
  await page.getByRole('navigation', { name: page.viewportSize()!.width <= 900 ? 'スマホメニュー' : 'メインメニュー' }).getByRole('button', { name, exact: true }).click();
}
async function noOverflow(page: Page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }

for (const width of [320, 390, 1280]) {
  test(`モード切替・Godot 2D学習・個別保存・履歴の互換性 ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      if (localStorage.getItem('test-seeded')) return;
      localStorage.setItem('pybricks-known', '["position","return"]');
      localStorage.setItem('pybricks-saved', '["torque"]');
      localStorage.setItem('pybricks-quiz-history', '["motor"]');
      localStorage.setItem('test-seeded', 'true');
    });
    await page.goto('');
    await expect(page.getByLabel('学習モード', { exact: true })).toHaveValue('pybricks');
    await expect(page.getByText('あと 118 語でコンプリート')).toBeVisible();
    await page.getByLabel('学習モード', { exact: true }).selectOption('godot');
    await expect(page.getByText('あと 60 語でコンプリート')).toBeVisible();
    await expect(page).toHaveTitle(/Godot/);
    if (width > 900) await expect(page.getByRole('link', { name: '公式ドキュメント ↗' })).toHaveAttribute('href', 'https://docs.godotengine.org/ja/stable/');
    await noOverflow(page);
    await page.screenshot({ path: `test-results/godot-home-${width}.png`, fullPage: true });
    await navigate(page, '単語リスト');
    await expect(page.locator('.word-row')).toHaveCount(60);
    await page.locator('.filter-row').getByRole('button', { name: '2Dノード', exact: true }).click();
    await expect(page.locator('.word-row')).toHaveCount(12);
    await page.locator('.filter-row').getByRole('button', { name: 'すべて', exact: true }).click();
    for (const word of ['var', 'const', 'CharacterBody2D', '_physics_process']) {
      await page.getByRole('textbox', { name: '単語を検索' }).fill(word);
      await expect(page.locator('.word-row')).toHaveCount(1);
      await expect(page.locator('.word-main h2')).toHaveText(word);
      await noOverflow(page);
    }
    expect(await page.locator('.word-detail code').evaluate(node => getComputedStyle(node).whiteSpace)).toBe('pre');
    await page.screenshot({ path: `test-results/godot-code-${width}.png`, fullPage: true });
    await page.getByRole('textbox', { name: '単語を検索' }).fill('var');
    await page.getByRole('button', { name: '覚えた', exact: true }).click();
    await page.getByRole('button', { name: 'varを復習リストに追加' }).click();
    await page.getByRole('button', { name: 'ゆっくり', exact: true }).click();
    await navigate(page, 'カード学習');
    await expect(page.locator('.card-front strong')).toHaveText('Node');
    await page.getByRole('button', { name: 'Nodeのカードをめくる', exact: true }).click();
    await expect(page.locator('.card-back strong')).toHaveText('シーンを構成する基本要素');
    await page.getByRole('button', { name: '覚えた ✓', exact: true }).click();
    await expect(page.locator('.card-front strong')).toHaveText('Node2D');
    await navigate(page, 'ミニテスト');
    for (let index = 0; index < 5; index++) {
      const word = await page.locator('.quiz-question h2').innerText();
      const term = GODOT_TERMS.find(term => term.word === word)!; expect(term).toBeTruthy();
      const choices = await page.locator('.choice').allTextContents();
      await page.locator('.choice').nth(choices.findIndex(text => text.slice(1) === term.meaning)).click();
      await page.getByRole('button', { name: index === 4 ? '結果を見る →' : '次の問題 →' }).click();
    }
    await expect(page.getByText('全問正解です。Godotの英語がしっかり身についています。')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('学習モード', { exact: true })).toHaveValue('godot');
    await expect(page.getByRole('button', { name: 'ゆっくり', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByLabel('学習データファイル').setInputFiles({ name: 'pybricks.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ known: ['return'], saved: [], quizHistory: [], speechRate: 'normal' })) });
    await expect(page.getByText('Pybricksモードに切り替えてから読み込んでください。')).toBeVisible();
    const downloadEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'データを書き出す' }).click();
    const download = await downloadEvent; const stream = await download.createReadStream(); let text = ''; for await (const chunk of stream!) text += chunk.toString();
    const backup = JSON.parse(text); expect(backup.mode).toBe('godot'); expect(backup.known).toContain('var'); expect(backup.saved).toEqual(['var']);
    await page.getByLabel('学習データファイル').setInputFiles({ name: 'godot.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await page.getByRole('button', { name: 'このデータを追加する' }).click();
    await expect(page.getByText('学習データを読み込みました。')).toBeVisible();
    await page.getByLabel('学習モード', { exact: true }).selectOption('pybricks');
    await expect(page.getByText('あと 118 語でコンプリート')).toBeVisible();
    await expect(page.getByRole('button', { name: '普通', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const original = await page.evaluate(() => ['pybricks-known', 'pybricks-saved', 'pybricks-quiz-history'].map(key => JSON.parse(localStorage.getItem(key)!)));
    expect(original).toEqual([['position', 'return'], ['torque'], ['motor']]);
    await page.getByLabel('学習データファイル').setInputFiles({ name: 'godot.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await expect(page.getByText('Godotモードに切り替えてから読み込んでください。')).toBeVisible();
    for (const mode of ['godot', 'pybricks', 'godot', 'pybricks']) await page.getByLabel('学習モード', { exact: true }).selectOption(mode);
    await page.reload();
    await expect(page.getByLabel('学習モード', { exact: true })).toHaveValue('pybricks');
    await expect(page.getByText('あと 118 語でコンプリート')).toBeVisible();
    await noOverflow(page); expect(errors).toEqual([]);
  });
}
