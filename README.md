# Word Lab — Pybricks / Godot 2D

PybricksとGodot 2Dの英単語を日本語の意味・読み方・説明・コード例で学ぶ、スマートフォン対応の静的Reactアプリです。検索、カテゴリー、★復習、カード学習、5問四択テスト、端末の英語音声再生を備えています。

画面上部の「学習モード」で **Pybricksモード（140語）** と **Godotモード（100語）** を切り替えます。選んだモードは次回も保持します。切り替えるとホームへ戻り、検索・カード・進行中のテストはリセットします。習得・★復習・出題履歴・発音速度はモードごとに保存します。既存のPybricks履歴はそのまま使えます。

GodotモードはGodot 4.xの2D制作向けです。Node2D・Sprite2D・CharacterBody2Dなどのノード、`var`・`const`・`func`・`@export`・`@onready`などの構文、`_ready`・`_process`・`_physics_process`・`move_and_slide`などの関数、`position`・`velocity`などの変数を収録しています。コード例は対応するノードのスクリプトの一部で、参照先の子ノード・アニメーションやコールバックはプロジェクト内で用意します。TileMapLayerはGodot 4.3以降のノードです。

Godotの語句・APIの確認元：

- https://docs.godotengine.org/ja/stable/tutorials/scripting/gdscript/gdscript_basics.html
- https://docs.godotengine.org/ja/stable/classes/class_node.html
- https://docs.godotengine.org/ja/stable/classes/class_characterbody2d.html

この環境では公式GitHub原本 `godotengine/godot` と `godotengine/godot-docs` の `4.5-stable` / `4.5` を参照しました。

## コード診断

### エラー名の読み方・意味

「コード診断」内の **エラー名を学ぶ** から、読み方・意味・短いコードからエラー名を選ぶ3種類の四択に取り組めます。Pybricks側はSyntaxError・NameError・TypeError・AttributeError・IndentationError・IndexError・ZeroDivisionError・ImportErrorの8語、Godot側はParse Error・Invalid callなどのエラー表現8語です。計16語・48問から、1回5問を出題します。

回答後に英語・カタカナ・日本語の意味と修正例を表示し、端末の英語音声で発音も確認できます。「エラー名・表現の一覧を見る」では8語をまとめて確認できます。Godotの項目は例外クラス名とは区別し、実際の表示文がバージョンや状況によって変わることも説明しています。

教材は `src/error-terms.ts` で管理します。読み方・意味の問題では回答前に解説や例のコードを表示せず、答えが先に見えないようにしています。再挑戦は選んだ学習内容の中から出題します。

### コードの書き直し・原因

ホームの「直してみる」またはメニューの「コード診断」から、短いコードの四択問題に取り組めます。Pybricks・Godot 2Dに12問ずつ、合計24問を収録しています。

- **書き直しを選ぶ**：構文・字下げ・型・引数・単位などを正しいコードへ直す。
- **原因を見つける**：未定義の名前、メソッドのつづり、ノードのパス、null参照などの原因を判断する。
- 1回5問で、回答すると正しい選択肢・修正コード・理由・関連単語を表示する。
- 結果画面では全問を振り返り、間違えた問題だけを1問から復習できる。「別の5問」は直前の問題を避けて選ぶ。

Godotでは `var` / `const`、`func`、`extends`、`connect`、Godot 4の `move_and_slide()` と `delta` の扱いなども確認します。問題の前提は各設問に記載しています。

教材データは `src/code-exercises.ts`、画面は `src/CodeLab.tsx` です。診断結果は現在のセッション内で保持し、画面移動・モード変更・再読み込みで初期化します。単語の習得・復習・出題履歴の保存内容とは独立しています。

修正コード12件ずつについて、Pybricks側はPythonの構文解析、Godot側は適切な継承元・関数に組み込んでGodot 4.6.3の `--check-only` を実施しています。ロボット実機やGodotの完成シーンでの動作確認を表すものではありません。

公開URL：**https://ecleaire.github.io/ward/**（[Godot100語への拡充をActions #10でデプロイ成功](https://github.com/ecleaire/ward/actions/runs/43127815016)。この作業環境からの公開URL閲覧は通信制限のため未検証）

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

ブラウザーテストは320px・390px・1280pxで検索、カテゴリー、★復習、カード、5問の採点と再挑戦、履歴20問の回避、発音速度の指定、履歴の入出力と再読み込みを検証します。両モードの切替・履歴の分離・選択モードの保存・旧Pybricksファイルとの互換性・異なるモードへの誤取込も確認します。システムの `/usr/bin/chromium` があれば使用し、なければPlaywrightのChromiumを使用します。任意の実行ファイルは `CHROMIUM_PATH` で指定できます。スクリーンショットは `test-results/` に生成します。

音声は端末の `speechSynthesis` に依存します。普通は1.0、ゆっくりは0.65です。自動テストでは英語・速度を音声APIへ渡すことを確認し、実機での音声聴取は検証していません。

GitHub ActionsではUbuntuランナー標準のGoogle Chrome（なければChromium）を `CHROMIUM_PATH` に指定して検証します。ブラウザーの追加インストール待ちを避け、ビルドは15分で打ち切る設定です。新しい更新が来た場合は、進行中の古い公開処理を置き換えます。

## 更新と公開

Pybricksの単語は `src/terms.ts` の `TERMS`、Godotの単語は `src/godot-terms.ts` の `GODOT_TERMS` に追加します。モード設定は `src/catalog.ts` で管理します。`word` は各モード内での履歴識別子なので、既存語の変更時は保存済み履歴への影響も確認してください。語数は画面上で自動計算します。テストの初期語数も追加後の期待値へ更新します。

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

Godotはそれぞれ `godot-known`・`godot-saved`・`godot-quiz-history`・`godot-speech-rate` を使います。選択モードは `word-lab-mode` に保存します。モードごとにセッションを作り直すため、同名の単語でも進捗は混ざりません。

ホームの「学習データの引き継ぎ」から**現在のモード**のJSONファイルを書き出し、新しい端末・サイトの同じモードで読み込みます。読み込み前に件数を表示し、既存の習得・復習へ追加します。発音速度は読み込んだ値になり、出題履歴は統合後の末尾20問になります。不明な単語IDは除きます。不正な型や非対応バージョンは取り込みません。ファイルには `mode` を付け、別モードへの取込は拒否します。従来の `mode` がない形式と旧Sites形式はPybricksのデータとして読み込みます。

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
