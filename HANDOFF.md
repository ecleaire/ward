# 継続作業メモ

## Godotの追加20語（現在は100語）

- Godot 2Dを80語から100語へ拡充。Pybricksは140語を維持。
- CollisionPolygon2D・VisibleOnScreenNotifier2D・Parallax2D・GPUParticles2D・NavigationAgent2Dなどのノードと、add_child・remove_child・get_tree・set_deferred・load・normalizedなどを収録。
- 各語に日本語の読み方・意味・説明・Godot 4向けコード例を用意。単語IDと既存の保存データ形式は変更しない。
- テスト44件成功。追加20語すべてについて、320px幅での検索・コード例・横はみ出しがないことを確認。
- `6f74e1e` を[Actions #10](https://github.com/ecleaire/ward/actions/runs/43127815016)でデプロイ成功。Godot100語・Pybricks140語の構成を https://ecleaire.github.io/ward/ へ公開済み。

## 前回の単語追加（140語／80語時点）

- 前回未反映だった追加候補を含め、各モード20語ずつ計40語を追加。Pybricks140語、Godot 2D80語。
- Pybricksはencoder・PID・proportional・precision・frequency・integer・exceptionなど。Godotはint・float・Array・Dictionary・await・instantiate・Timer・RayCast2D・Tweenなど。
- 各語に読み方・意味・説明・コード例を収録。既存の単語IDと履歴の形式は維持。
- テスト44件成功。追加全40語の検索結果とコード例を320px幅で確認し、横はみ出しがないことも検証。
- 公開時にブラウザーの追加導入で長時間待機したため、CIをランナー標準のGoogle Chrome／Chromiumで実行する構成へ変更。新しい公開処理が古い実行を置き換える設定と、15分のビルド上限を追加。
- 追加データは `a7746a1`、CI調整は `992a8b0`。[Actions #9](https://github.com/ecleaire/ward/actions/runs/43041245734)が1分44秒で成功し、140語／80語の構成を公開済み。

## エラー名の読み方・意味

- コード診断内に「コードを直す」「エラー名を学ぶ」の切替を追加。英語・カタカナ・意味の一覧と、発音再生に対応。
- Pybricksの例外名8語とGodotのエラー表現8語、計16語。読み方／意味／コードからの判定の3種類、計48問を `src/error-terms.ts` に追加。
- Godotでは例外クラス名ではなく表現を学ぶこと、実際の表示文が環境で異なることを明示。既存の120語／60語の単語データ・履歴は変更していない。
- 出題を種類別に偏らず選ぶよう調整し、次のセッションにも各種類が残るようにした。
- 単体20件・ブラウザー24件が成功。320/390/1280pxで読み方・意味・コード判定、一覧、発音APIへの速度指定、正解後の読み表示と再挑戦を確認。
- `19765b7` は[Actions #7](https://github.com/ecleaire/ward/actions/runs/42828299487)でデプロイ成功。公開URLは https://ecleaire.github.io/ward/ 。

## コード診断の追加

- 両モードに12問ずつ、計24問の短いコード診断を追加。ホームと5つ目のナビから入れる。
- 正しい書き直し／エラー原因の四択を1回5問出題し、回答後に修正コードと解説・関連単語を表示。結果の振り返りと間違いだけの再挑戦に対応。
- 教材は `src/code-exercises.ts`、画面は `src/CodeLab.tsx`、CSSは `src/code-lab.css`。診断の結果は画面内だけで保持し、単語の永続履歴には加算しない。
- 修正コードはPython構文解析12件、Godot 4.6.3の適切な文脈でのcheck-only12件が成功。ハードウェア・完成シーンでの実行検証とは区別する。
- 単体16件・ブラウザー18件が成功。診断は320/390/1280pxの両モードで誤答・正答・4/5の採点・間違い1問の再挑戦・単語履歴を変更しないことまで確認。
- `23acd9e` を[Actions #6](https://github.com/ecleaire/ward/actions/runs/42674680482)でデプロイ成功。公開URLは https://ecleaire.github.io/ward/ 。公開後の画面閲覧は環境の通信制限で未検証。

## 現在の学習モード

- 画面上部からPybricks（140語）とGodot 2D（100語）を切替。Godotはノード名・GDScript構文（var/constなど）・関数・変数・描画・UI入力を収録。
- 単語とカテゴリーは `src/catalog.ts`、`src/terms.ts`、`src/godot-terms.ts` で管理。
- 旧 `pybricks-*` の保存キーを維持。Godotは `godot-*` に分離。選択モードは `word-lab-mode` に保存。コード例の改行・字下げも表示する。
- 書出しファイルはモード別。旧ファイルはPybricksとして互換読込、異なるモードへの取込は拒否する。
- モード切替・再読込・同名語の履歴分離・Godot検索/カード/四択・ファイル往復を320/390/1280pxで検証。単体10件・ブラウザー12件が成功。
- モード追加コミット `493ef85` は[Actions #5](https://github.com/ecleaire/ward/actions/runs/42640102566)でデプロイ成功。公開URLは https://ecleaire.github.io/ward/ 。この環境からの公開URL閲覧は通信制限で引き続き未検証。
- 以下の移行・公開記録は過去の経緯。最新の公開結果はGitHub Actionsを参照。

## 完了した実装と検証

- 90語・ホーム・単語一覧・カード・四択テストをVite＋Reactの静的構成へ移行。
- 44px以上のタップ領域、★復習絞り込み、カードで次の未習得語を飛ばす不具合を修正。
- 4つのlocalStorageキーを維持し、JSON書出し・プレビュー付き統合取込・旧キー形式取込を追加。
- Geistをローカル配信。未転送の `og.png` への参照は削除。
- `npm test`：6件成功。`npm run build`：成功。
- `npm run test:e2e`：320/390/1280pxの9件成功。検索、カテゴリー、復習、カード、速度指定、5問×5回の採点・重複回避、履歴の入出力・再読込を検証。スクリーンショットで表示も確認。
- 音声APIに英語と速度1.0/0.65を渡すことはテスト済み。実機音声の聴取・全OS対応は未確認。
- `main` へ `fc13d508d9bc0888d5e04823b3f2ac143d46d8eb` をpushし、リモートSHA一致を確認。
- GitHub Actionsがpushで開始することを確認。実行：https://github.com/ecleaire/ward/actions/runs/42608701172
- この初回実行は `configure-pages` で失敗。公開概要のAnnotationsで `Get Pages site failed` / `Not Found` と「Pagesを有効にしてGitHub Actionsを公開元に指定すること」を確認。静的成果物のビルドや単体・ブラウザーテストの問題ではなく、Pagesの初回設定が残っている。

## 再試行後の公開状況

- `04fbcde` をpushして再試行し、[Actions #3](https://github.com/ecleaire/ward/actions/runs/42610364739) が **Success** で完了。build 55秒、deploy 8秒。Pagesの初回設定に関する失敗は解消した。
- Actionsのdeploy結果に **https://ecleaire.github.io/ward/** が表示され、`github-pages` アーティファクトも生成された。GitHub Pagesへの公開成功を確認済み。
- このクラウド実行環境は引き続きリビジョン1・カスタム通信許可なし。公開URLへの取得は403になるため、公開サイト上のHTTP正常応答・アセット・画面操作の確認は未完了。ローカル成果物の単体6件・ブラウザー9件の成功は前述のとおり。

## 公開URLの検証に残る作業

1. クラウド環境の設定で、保存済みのネットワーク変更案を確認・保存してPublishする。追加するのは `api.github.com` と `ecleaire.github.io` の2ドメインだけ。既存のパッケージマネージャープリセット・リポジトリ設定は保持している。ドラフト保存だけでは実行環境へ適用されない。
2. 環境の状態を再取得し、許可ルール適用を確認してからAPIと公開URLへ新規接続する。APIは現時点でプロキシのCONNECT 403により拒否される。`gh auth status` も失敗するが、通信制限の解消前に認証が無効と断定しない。Gitのpushは既存のプラットフォーム認証で成功している。
3. https://ecleaire.github.io/ward/ でHTTP応答・`/ward/assets/`・画面操作を確認する。Pages設定の変更や公開の再実行は、今の成功状態では不要。

## 保持する方針

- 今後の作業先はこのタスクと `ecleaire/ward`。更新と公開をセットで進める。
- 旧Sitesの停止・削除は未承認。別アプリを変更しない。
- 旧サイトの履歴はブラウザーのorigin制限で自動取得できない。旧サイトに書出し機能は追加していない。現状の移行方法はホームとREADMEの読み取り専用コンソール手順。スマートフォンのみの移行操作には制約が残る。
- 旧 `og.png` と旧Git履歴・旧ロックファイルは未取得。転送済みと報告しない。
- 日本語UI、スマホ対応、日本の技術教材で定着したカタカナ表記（torqueはトルク）を維持する。

構成・実行方法・元プロジェクト情報はREADMEを参照。
