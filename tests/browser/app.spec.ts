import { test, expect, type Page } from '@playwright/test';
import { TERMS } from '../../src/terms';

async function navigate(page: Page, label: string) {
  const mobile = (page.viewportSize()?.width ?? 1280) <= 900;
  await page.getByRole('navigation', { name: mobile ? 'スマホメニュー' : 'メインメニュー' }).getByRole('button', { name: label, exact: true }).click();
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

for (const width of [320, 390, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });
    test('ホーム・検索・カテゴリー・復習・カード・保存・音声速度', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        Object.defineProperty(window, 'speechSynthesis', { value: { cancel() {}, getVoices: () => [], speak: (utterance: SpeechSynthesisUtterance) => { (window as unknown as { spoken: unknown[] }).spoken = [utterance.text, utterance.lang, utterance.rate]; } } });
      });
      await page.goto('');
      await expect(page.getByText('あと 90 語でコンプリート')).toBeVisible();
      for (const button of [page.getByRole('button', { name: 'ゆっくり', exact: true }), page.getByRole('button', { name: 'チェックする →' })]) {
        const box = await button.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
      }
      await noOverflow(page);
      await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'ゆっくり', exact: true }).click();
      await navigate(page, '単語リスト');
      await expect(page.locator('.word-row')).toHaveCount(90);
      await page.getByRole('textbox', { name: '単語を検索' }).fill('トルク');
      await expect(page.locator('.word-row')).toHaveCount(1);
      const star = page.getByRole('button', { name: 'torqueを復習リストに追加' });
      const box = await star.boundingBox(); expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
      await star.click();
      await page.getByRole('button', { name: 'torqueの発音を聞く' }).click();
      const spoken = await page.evaluate(() => (window as unknown as { spoken: unknown[] }).spoken);
      expect(spoken.slice(0, 2)).toEqual(['torque', 'en-US']);
      expect(spoken[2]).toBeCloseTo(0.65);
      await page.getByRole('button', { name: '普通', exact: true }).click();
      await page.getByRole('button', { name: 'torqueの発音を聞く' }).click();
      expect(await page.evaluate(() => (window as unknown as { spoken: unknown[] }).spoken)).toEqual(['torque', 'en-US', 1]);
      await noOverflow(page);
      await page.screenshot({ path: `test-results/words-${width}.png`, fullPage: true });
      await page.getByRole('textbox', { name: '単語を検索' }).fill('');
      await page.locator('.filter-row').getByRole('button', { name: 'センサー', exact: true }).click();
      await expect(page.locator('.word-row')).toHaveCount(14);
      await navigate(page, 'ホーム');
      await page.getByRole('button', { name: 'チェックする →' }).click();
      await expect(page.locator('.word-row')).toHaveCount(1);
      await expect(page.locator('.word-main h2')).toHaveText('torque');
      await page.getByRole('button', { name: 'torqueを復習リストから外す' }).click();
      await expect(page.getByText('条件に合う単語がありません。')).toBeVisible();
      await navigate(page, 'カード学習');
      await expect(page.locator('.card-front strong')).toHaveText('motor');
      await page.getByRole('button', { name: 'motorのカードをめくる' }).click();
      await expect(page.locator('.card-back strong')).toHaveText('モーター / 動力装置');
      await noOverflow(page);
      await page.screenshot({ path: `test-results/study-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: '覚えた ✓', exact: true }).click();
      await expect(page.locator('.card-front strong')).toHaveText('angle');
      await page.getByRole('button', { name: '↻ もう一度' }).click();
      await expect(page.locator('.card-front strong')).toHaveText('speed');
      await page.reload();
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pybricks-known')!))).toEqual(['motor']);
      expect(errors).toEqual([]);
    });

    test('5問の採点・再挑戦・直近20問回避と再読込', async ({ page }) => {
      await page.goto(''); await navigate(page, 'ミニテスト');
      const asked: string[] = [];
      for (let round = 0; round < 5; round++) {
        for (let index = 0; index < 5; index++) {
          const word = (await page.locator('.quiz-question h2').textContent())!;
          expect(asked.slice(-20)).not.toContain(word); asked.push(word);
          const term = TERMS.find(item => item.word === word)!;
          await expect(page.locator('.choice')).toHaveCount(4);
          const choices = await page.locator('.choice').allTextContents();
          const correct = page.locator('.choice').nth(choices.findIndex(text => text.slice(1) === term.meaning));
          await correct.click();
          await expect(page.getByText('✓ 正解！', { exact: true })).toBeVisible();
          await expect(correct).toBeDisabled();
          await noOverflow(page);
          if (round === 0 && index === 0) await page.screenshot({ path: `test-results/quiz-${width}.png`, fullPage: true });
          await page.getByRole('button', { name: index === 4 ? '結果を見る →' : '次の問題 →' }).click();
        }
        await expect(page.locator('.result-score')).toHaveText('5/ 5');
        await expect(page.getByRole('heading', { name: 'PERFECT!' })).toBeVisible();
        if (round < 4) await page.getByRole('button', { name: '別の5問に挑戦 →' }).click();
      }
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pybricks-quiz-history')!))).toEqual(asked.slice(-20));
      await page.reload(); await navigate(page, 'ミニテスト');
      const next = (await page.locator('.quiz-question h2').textContent())!;
      expect(asked.slice(-20)).not.toContain(next);
    });

    test('旧履歴の取込・統合・書出し・不正ファイル・再読込', async ({ page }) => {
      await page.goto('');
      const legacy = { 'pybricks-known': '["motor"]', 'pybricks-saved': '["torque"]', 'pybricks-quiz-history': '["angle"]', 'pybricks-speech-rate': 'slow' };
      await page.locator('summary').click();
      await page.getByLabel('旧サイトのJSON', { exact: true }).fill(JSON.stringify(legacy));
      await page.getByRole('button', { name: '貼り付けたデータを確認' }).click();
      await expect(page.getByText('読み込み内容：習得 1語・★復習 1語・出題履歴 1問・発音 ゆっくり')).toBeVisible();
      await page.getByRole('button', { name: 'このデータを追加する' }).click();
      await expect(page.getByText('学習データを読み込みました。')).toBeVisible();
      const downloadEvent = page.waitForEvent('download');
      await page.getByRole('button', { name: 'データを書き出す' }).click();
      const download = await downloadEvent;
      const stream = await download.createReadStream(); let content = ''; for await (const chunk of stream!) content += chunk.toString();
      expect(JSON.parse(content)).toMatchObject({ known: ['motor'], saved: ['torque'], quizHistory: ['angle'], speechRate: 'slow' });
      await page.getByLabel('学習データファイル').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"known":[5]}') });
      await expect(page.getByText('発音速度の値が正しくありません。')).toBeVisible();
      await expect(page.locator('.import-preview')).toHaveCount(0);
      await page.getByLabel('学習データファイル').setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ known: ['angle'], saved: ['motor'], quizHistory: ['speed'], speechRate: 'normal' })) });
      await page.getByRole('button', { name: 'このデータを追加する' }).click();
      await page.reload();
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pybricks-known')!))).toEqual(['motor', 'angle']);
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pybricks-saved')!))).toEqual(['torque', 'motor']);
      await expect(page.getByRole('button', { name: '普通', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await noOverflow(page);
    });
  });
}
