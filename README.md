# Pybricks Word Lab

Pybricksの英単語を日本語の意味・読み方・説明・コード例で学ぶ、スマートフォン対応の静的Reactアプリです。120語、検索、カテゴリー、★復習、カード学習、5問四択テスト、端末の英語音声再生を備えています。

公開URL：**https://ecleaire.github.io/ward/**（[Actions #3でデプロイ成功](https://github.com/ecleaire/ward/actions/runs/42610364739)。この作業環境からの公開URL閲覧は通信制限のため未検証）

## 開発

Node.js 22.13以上とnpmを使います。

```sh
npm ci
npm run dev
```

開発URLは `http://localhost:5173/ward/` です。

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
```

ブラウザーテストは320px・390px・1280pxで検索、カテゴリー、★復習、カード、5問の採点と再挑戦、履歴20問の回避、発音速度の指定、履歴の入出力と再読み込みを検証します。システムの `/usr/bin/chromium` があれば使用し、なければPlaywrightのChromiumを使用します。任意の実行ファイルは `CHROMIUM_PATH` で指定できます。スクリーンショットは `test-results/` に生成します。

音声は端末の `speechSynthesis` に依存します。普通は1.0、ゆっくりは0.65です。自動テストでは英語・速度を音声APIへ渡すことを確認し、実機での音声聴取は検証していません。

## 更新と公開

単語は `src/terms.ts` の `TERMS` に追加します。`word` は履歴の識別子なので、既存語の変更時は保存済み履歴への影響も確認してください。語数は画面上で自動計算します。テストの初期語数も追加後の期待値へ更新します。

1. 修正後に `npm test`、`npm run build`、`npm run test:e2e` を実行。
2. `main` にコミットをpush。
3. Actionsの **Deploy Word Lab to Pages** が成功したことを確認。
4. 公開URLで更新内容とアセットの読み込みを確認。

初回はリポジトリの **Settings → Pages → Build and deployment → Source → GitHub Actions** を選びます。ワークフローは依存インストール・単体テスト・ビルド・ブラウザーテストの後、`dist/` をPagesへ公開します。手動実行にも対応しています。Viteの `base` は `/ward/` です。

構成の根拠：

- https://vite.dev/guide/static-deploy.html#github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

環境でドキュメントサイトへのアクセスが制限されていたため、同じ公式文書の `vitejs/vite` と `github/docs` のGitHub原本を確認しています。ActionsのバージョンはVite公式の現行サンプルにあるコミットへ固定しています。

## 学習データを移す

保存はブラウザー内のlocalStorageのみで、DBや外部サービスは使いません。

| キー | 内容 |
| --- | --- |
| `pybricks-known` | 習得した単語 |
| `pybricks-saved` | ★復習の単語 |
| `pybricks-quiz-history` | 直近20問 |
| `pybricks-speech-rate` | 発音速度 |

ホームの「学習データの引き継ぎ」からJSONファイルを書き出し、新しい端末・サイトで読み込みます。読み込み前に件数を表示し、既存の習得・復習へ追加します。発音速度は読み込んだ値になり、出題履歴は統合後の末尾20問になります。不明な単語IDは除きます。不正な型や非対応バージョンは取り込みません。

**旧Sitesの履歴は自動で移りません。** サイトのoriginが違うためです。旧サイトに書き出し機能がない場合は、履歴があるブラウザーで旧サイトを開き、開発者ツールのコンソールで次を実行します。保存内容の読み取りのみで、旧データを変更しません。

```js
JSON.stringify({
  "pybricks-known": localStorage.getItem("pybricks-known") || "[]",
  "pybricks-saved": localStorage.getItem("pybricks-saved") || "[]",
  "pybricks-quiz-history": localStorage.getItem("pybricks-quiz-history") || "[]",
  "pybricks-speech-rate": localStorage.getItem("pybricks-speech-rate") || "normal"
})
```

表示されたJSON文字列の内容をコピーし、新サイトの「旧サイトから履歴を移すには」へ貼り付けます。コンソールが結果を文字列として囲む外側の引用符は含めず、`{` から `}` までをコピーします。スマートフォンだけではコンソール操作が難しい場合があります。履歴は端末・ブラウザーごとに異なり、PC上の旧サイトからスマートフォン上の履歴は取得できません。

## 移行元と引き継ぎ

元の `app/page.tsx` の90語・画面とCSSを、Sites/vinext依存のないVite＋Reactへ移行しました。旧サイトのソースGit履歴は転送されていないため、このリポジトリの履歴は移行時点から始まります。

- 旧サイト：https://pybricks-word-lab.echo0607chiaki.chatgpt.site/
- 旧Sites project ID：`appgprj_6a87bf9d849c8191aaed856b60bddb03`
- 引き継ぎ時の公開：v7、元HEAD `4739db19d309fb1eacfced3cfcb57d8604124ce0`
- 元Windows作業先：`C:\Users\echo0\Documents\web\pybricks-vocab-lab`
- **旧サイトの停止・削除は未承認で、実施していません。別アプリも変更していません。**
- 未転送：旧 `og.png` と旧 `package-lock.json`。旧画像へのメタデータ参照は外し、ロックファイルはこの構成で生成しています。フォントはローカル配信します。
- 修正：44px以上の主要タップ領域、★復習の絞り込み、カード習得時の単語スキップ、破損した保存データの処理、履歴ファイルの入出力。固定の `1 day streak` は実績と誤認されない語数表示へ変更しました。

公開が環境のアクセス権で止まった場合は `HANDOFF.md` を参照してください。
