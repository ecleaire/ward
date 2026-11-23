import { test, expect, type Page } from '@playwright/test';
import { CATALOGS } from '../../src/catalog';

async function navigate(page: Page, label: string) {
  await page.getByRole('navigation', { name: 'スマホメニュー' }).getByRole('button', { name: label, exact: true }).click();
}

test.use({ viewport: { width: 390, height: 844 } });
for (const mode of ['pybricks', 'godot'] as const) {
  test(`カードを一周以上した後に習得しても次の単語を飛ばさない ${mode}`, async ({ page }) => {
    const terms = CATALOGS[mode].terms;
    await page.addInitScript(({ mode, known }) => {
      localStorage.setItem('word-lab-mode', mode);
      localStorage.setItem(`${mode}-known`, JSON.stringify(known));
    }, { mode, known: terms.slice(3).map(term => term.word) });
    await page.goto(''); await navigate(page, 'カード学習');
    for (let count = 0; count < 5; count++) await page.getByRole('button', { name: '↻ もう一度' }).click();
    await expect(page.locator('.card-front strong')).toHaveText(terms[2].word);
    await page.getByRole('button', { name: '覚えた ✓', exact: true }).click();
    await expect(page.locator('.card-front strong')).toHaveText(terms[0].word);
  });
}

test('一覧で習得状態を変えても次のカードの答えが勝手に開かない', async ({ page }) => {
  await page.goto(''); await navigate(page, 'カード学習');
  await page.getByRole('button', { name: 'motorのカードをめくる' }).click();
  await expect(page.locator('.card-back')).toBeVisible();
  await navigate(page, '単語リスト');
  await page.getByRole('textbox', { name: '単語を検索' }).fill('motor');
  await page.locator('.word-row').filter({ has: page.getByRole('heading', { name: 'motor', exact: true }) }).getByRole('button', { name: '覚えた', exact: true }).click();
  await navigate(page, 'カード学習');
  await expect(page.locator('.card-front strong')).toHaveText('angle');
  await expect(page.locator('.card-back')).toHaveCount(0);
});

test('保存履歴を読み出せない間は既存データを空で上書きしない', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pybricks-known', '["motor"]');
    localStorage.setItem('pybricks-saved', '["angle"]');
    const original = Storage.prototype.getItem;
    (window as unknown as { failProgressRead: boolean }).failProgressRead = true;
    Storage.prototype.getItem = function (key: string) {
      if (key === 'pybricks-known' && (window as unknown as { failProgressRead: boolean }).failProgressRead) {
        (window as unknown as { failProgressRead: boolean }).failProgressRead = false;
        throw new Error('temporary read failure');
      }
      return original.call(this, key);
    };
  });
  await page.goto('');
  await expect(page.getByRole('button', { name: '履歴の読み込みを再試行' })).toBeVisible();
  const known = await page.evaluate(() => {
    (window as unknown as { failProgressRead: boolean }).failProgressRead = false;
    return localStorage.getItem('pybricks-known');
  });
  expect(known).toBe('["motor"]');
  await page.getByRole('button', { name: '履歴の読み込みを再試行' }).click();
  await expect(page.getByText('あと 139 語でコンプリート')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('pybricks-saved'))).toBe('["angle"]');
});

test('履歴ファイルを選び直した後に古い読み込みが完了しても新しい選択を保持する', async ({ page }) => {
  await page.addInitScript(() => {
    const original = File.prototype.text;
    File.prototype.text = function () {
      if (this.name === 'slow.json') return new Promise<string>(resolve => {
        (window as unknown as { finishSlowFile: () => void }).finishSlowFile = () => { original.call(this).then(resolve); };
      });
      return original.call(this);
    };
  });
  await page.goto('');
  const payload = (known: string[]) => Buffer.from(JSON.stringify({ known, saved: [], quizHistory: [], speechRate: 'normal' }));
  await page.getByLabel('学習データファイル').setInputFiles({ name: 'slow.json', mimeType: 'application/json', buffer: payload(['motor']) });
  await page.getByLabel('学習データファイル').setInputFiles({ name: 'fast.json', mimeType: 'application/json', buffer: payload(['angle', 'speed']) });
  await expect(page.locator('.import-preview')).toContainText('習得 2語');
  await page.evaluate(() => (window as unknown as { finishSlowFile: () => void }).finishSlowFile());
  await page.waitForTimeout(100);
  await expect(page.locator('.import-preview')).toContainText('習得 2語');
  await page.getByRole('button', { name: 'このデータを追加する' }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pybricks-known')!))).toEqual(['angle', 'speed']);
});
