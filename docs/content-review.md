# 教材全件確認記録（2026-11-23）

対象はPybricks 140語・Godot 100語、エラー表現16語、コード診断24問とエラー学習48問。単語四択は固定問題ではなく、この240語から生成する。意味・説明・カタカナ・コード・正答・誤答・解説を確認した。既存の単語識別子と学習履歴を保持する。

## 確認方法と範囲

- 公式APIとGDScript資料を参照し、技術用語の日本語表記と英語の読み上げを区別した。カタカナは発音記号ではなく教材での読み方の目安。torqueは「トルク」を維持。
- Pybricksの単語コード140件と修正コード20件（診断12・エラー8）はPythonのast.parseで構文解析。APIは公式pybricks-apiの_common.py・pupdevices.py・robotics.py・tools.py・parameters.pyを照合した。ロボット実機での動作試験ではない。
- Godotの単語コード100件と修正コード20件はGodot 4.6.3の--check-onlyに成功。適切な継承元・関数スコープ・前提変数・コールバック・画像とシーンを補った検証用スクリプトで解析した。例示のノード配置・リソース・アニメーションは利用者のプロジェクトで用意する。完成ゲームの動作試験ではない。
- GodotのInvalid call、Invalid access、Invalid assignment、配列の範囲外について実行時エラー文を照合。Invalid assignmentは静的なint/Stringの不一致ではなく、Object参照経由のプロパティ代入に修正。範囲外の例は4.6ではInvalid access of indexと表示されるため、Out of boundsは関連表現だと明記し設問も変更した。
- Parse Errorは構文だけでなく静的な型や名前の誤りも含むと訂正。各エラー表現から生成される読み方・意味・コード判定の48問と、診断24問の正答が一つで選択肢が重複しないことを確認。
- 未完成のif/for/defと関数外のreturn/awaitを修正。ForceSensorのpressed、run_timeの呼び出し、減速度の設定、coastの使用例、duty cycleの説明、負荷の単位、headingの例を改善。
- 近い意味の訳を別の正答に見せないため、function/method、sample/measurement、speed/velocityなどの組を単語四択の誤答候補から除外。全240語について四つの異なる選択肢を生成できることを確認。
- 音声はCamelCase・snake_case・注釈・2D・略語を英語の単語や文字へ分ける。全240語とエラー16語の音声入力を点検。端末のspeechSynthesisを使うため、声・アクセント・略語の発音はOSや音声によって異なる。実際の音声を聞き取った検証は行っていない。

## 参照元

- [Pybricks公式API原本](https://github.com/pybricks/pybricks-api/tree/master/src/pybricks)（参照チェックアウト: e610a0a9a3ca4dcdd79342bfe11becbdfefe0c8f）
- [Pybricks公式ドキュメント](https://docs.pybricks.com/en/latest/)
- [Godot公式GDScript資料原本 4.5](https://github.com/godotengine/godot-docs/blob/4.5/tutorials/scripting/gdscript/gdscript_basics.rst)
- [Godot公式クラス仕様 4.5-stable](https://github.com/godotengine/godot/tree/4.5-stable/doc/classes)（Node、Node2D、CharacterBody2D、CanvasItem、Parallax2Dほか）
- [Godot公式日本語ドキュメント](https://docs.godotengine.org/ja/stable/)

## 単語の全件一覧

下表はすべて意味・説明・コードも確認した項目。音声入力欄は端末へ渡す文字列であり、実際の発音の保証ではない。

### Pybricks（140語）

| 単語 | カタカナ | 英語音声への入力 |
|---|---|---|
| motor | モーター | motor |
| angle | アングル | angle |
| speed | スピード | speed |
| brake | ブレーキ | brake |
| hold | ホールド | hold |
| stalled | ストールド | stalled |
| direction | ディレクション | direction |
| torque | トルク | torque |
| duty cycle | デューティ サイクル | duty cycle |
| target angle | ターゲット アングル | target angle |
| reset angle | リセット アングル | reset angle |
| load | ロード | load |
| coast | コースト | coast |
| rotation | ローテーション | rotation |
| rotation sensor | ローテーション センサー | rotation sensor |
| duty limit | デューティ リミット | duty limit |
| gear train | ギア トレイン | gear train |
| run time | ラン タイム | run time |
| run angle | ラン アングル | run angle |
| sensor | センサー | sensor |
| reflection | リフレクション | reflection |
| ambient | アンビエント | ambient |
| distance | ディスタンス | distance |
| pressed | プレスト | pressed |
| detect | ディテクト | detect |
| color | カラー | color |
| HSV | エイチ・エス・ブイ | H S V |
| force | フォース | force |
| surface | サーフェス | surface |
| intensity | インテンシティ | intensity |
| straight | ストレート | straight |
| turn | ターン | turn |
| drive | ドライブ | drive |
| wheel diameter | ホイール ダイアメーター | wheel diameter |
| axle track | アクスル トラック | axle track |
| acceleration | アクセラレーション | acceleration |
| heading | ヘディング | heading |
| turn rate | ターン レート | turn rate |
| curve | カーブ | curve |
| radius | ラジアス | radius |
| drive base | ドライブ ベース | drive base |
| wheel | ホイール | wheel |
| axle | アクスル | axle |
| state | ステート | state |
| displacement | ディスプレイスメント | displacement |
| hub | ハブ | hub |
| button | ボタン | button |
| display | ディスプレイ | display |
| battery | バッテリー | battery |
| IMU | アイ・エム・ユー | I M U |
| stationary | ステイショナリー | stationary |
| calibrated | キャリブレイテッド | calibrated |
| angular velocity | アンギュラー ベロシティ | angular velocity |
| shutdown | シャットダウン | shutdown |
| gyroscope | ジャイロスコープ | gyroscope |
| accelerometer | アクセロメーター | accelerometer |
| axis | アクシス | axis |
| charger | チャージャー | charger |
| current | カレント | current |
| friction | フリクション | friction |
| gear ratio | ギア レシオ | gear ratio |
| clockwise | クロックワイズ | clockwise |
| counterclockwise | カウンタークロックワイズ | counterclockwise |
| tolerance | トレランス | tolerance |
| maneuver | マニューバー | maneuver |
| forward | フォワード | forward |
| backward | バックワード | backward |
| deceleration | ディセラレーション | deceleration |
| orientation | オリエンテーション | orientation |
| tilt | ティルト | tilt |
| pitch | ピッチ | pitch |
| roll | ロール | roll |
| brightness | ブライトネス | brightness |
| firmware | ファームウェア | firmware |
| voltage | ボルテージ | voltage |
| hue | ヒュー | hue |
| saturation | サチュレーション | saturation |
| ultrasonic | ウルトラソニック | ultrasonic |
| Boolean | ブーリアン | Boolean |
| tuple | タプル | tuple |
| return | リターン | return |
| argument | アーギュメント | argument |
| port | ポート | port |
| wait | ウェイト | wait |
| initialize | イニシャライズ | initialize |
| parameter | パラメーター | parameter |
| class | クラス | class |
| method | メソッド | method |
| import | インポート | import |
| variable | バリアブル | variable |
| control | コントロール | control |
| limit | リミット | limit |
| position | ポジション | position |
| stop | ストップ | stop |
| done | ダン | done |
| tracking | トラッキング | tracking |
| presence | プレゼンス | presence |
| touched | タッチト | touched |
| light | ライト | light |
| measurement | メジャーメント | measurement |
| threshold | スレッショルド | threshold |
| calibration | キャリブレーション | calibration |
| odometry | オドメトリー | odometry |
| steering | ステアリング | steering |
| velocity | ベロシティ | velocity |
| millimeter | ミリメートル | millimeter |
| degree | ディグリー | degree |
| radian | ラジアン | radian |
| speaker | スピーカー | speaker |
| volume | ボリューム | volume |
| beep | ビープ | beep |
| pixel | ピクセル | pixel |
| icon | アイコン | icon |
| animation | アニメーション | animation |
| loop | ループ | loop |
| condition | コンディション | condition |
| function | ファンクション | function |
| list | リスト | list |
| dictionary | ディクショナリー | dictionary |
| asynchronous | アシンクロナス | asynchronous |
| encoder | エンコーダー | encoder |
| feedback | フィードバック | feedback |
| PID | ピー・アイ・ディー | P I D |
| proportional | プロポーショナル | proportional |
| integral | インテグラル | integral |
| derivative | デリバティブ | derivative |
| sample | サンプル | sample |
| range | レンジ | range |
| precision | プレシジョン | precision |
| interval | インターバル | interval |
| frequency | フリークエンシー | frequency |
| duration | デュレーション | duration |
| integer | インテジャー | integer |
| float | フロート | float |
| timeout | タイムアウト | timeout |
| exception | エクセプション | exception |
| attribute | アトリビュート | attribute |
| module | モジュール | module |
| object | オブジェクト | object |
| index | インデックス | index |

### Godot（100語）

| 単語 | カタカナ | 英語音声への入力 |
|---|---|---|
| Node | ノード | Node |
| Node2D | ノード・ツーディー | Node two D |
| Sprite2D | スプライト・ツーディー | Sprite two D |
| CharacterBody2D | キャラクターボディ・ツーディー | Character Body two D |
| Area2D | エリア・ツーディー | Area two D |
| CollisionShape2D | コリジョンシェイプ・ツーディー | Collision Shape two D |
| StaticBody2D | スタティックボディ・ツーディー | Static Body two D |
| RigidBody2D | リジッドボディ・ツーディー | Rigid Body two D |
| Camera2D | カメラ・ツーディー | Camera two D |
| TileMapLayer | タイルマップレイヤー | Tile Map Layer |
| Marker2D | マーカー・ツーディー | Marker two D |
| AnimatedSprite2D | アニメーテッドスプライト・ツーディー | Animated Sprite two D |
| var | バー | var |
| const | コンスト | const |
| func | ファンク | func |
| signal | シグナル | signal |
| extends | エクステンズ | extends |
| return | リターン | return |
| if | イフ | if |
| else | エルス | else |
| for | フォー | for |
| while | ホワイル | while |
| @export | エクスポート | export |
| @onready | オンレディ | on ready |
| position | ポジション | position |
| global_position | グローバルポジション | global position |
| velocity | ベロシティ | velocity |
| delta | デルタ | delta |
| move_and_slide | ムーブ・アンド・スライド | move and slide |
| is_on_floor | イズ・オン・フロア | is on floor |
| get_node | ゲット・ノード | get node |
| queue_free | キュー・フリー | queue free |
| _ready | レディ | ready |
| _process | プロセス | process |
| _physics_process | フィジックス・プロセス | physics process |
| Vector2 | ベクトル・ツー | vector two |
| texture | テクスチャ | texture |
| animation | アニメーション | animation |
| frame | フレーム | frame |
| play | プレイ | play |
| stop | ストップ | stop |
| visible | ビジブル | visible |
| modulate | モジュレート | modulate |
| scale | スケール | scale |
| rotation | ローテーション | rotation |
| z_index | ゼット・インデックス | z index |
| AnimationPlayer | アニメーションプレイヤー | Animation Player |
| CanvasLayer | キャンバスレイヤー | Canvas Layer |
| Control | コントロール | Control |
| Label | ラベル | Label |
| Button | ボタン | Button |
| Container | コンテナ | Container |
| VBoxContainer | ブイボックス・コンテナ | V box container |
| HBoxContainer | エイチボックス・コンテナ | H box container |
| MarginContainer | マージン・コンテナ | Margin Container |
| Input | インプット | Input |
| InputEvent | インプット・イベント | Input Event |
| is_action_pressed | イズ・アクション・プレスト | is action pressed |
| is_action_just_pressed | イズ・アクション・ジャスト・プレスト | is action just pressed |
| connect | コネクト | connect |
| int | イント | int |
| float | フロート | float |
| bool | ブール | bool |
| String | ストリング | String |
| Array | アレイ | Array |
| Dictionary | ディクショナリー | Dictionary |
| await | アウェイト | await |
| emit | エミット | emit |
| preload | プリロード | preload |
| instantiate | インスタンシエイト | instantiate |
| class_name | クラス・ネーム | class name |
| enum | イーナム | enum |
| match | マッチ | match |
| Timer | タイマー | Timer |
| RayCast2D | レイキャスト・ツーディー | Ray Cast two D |
| Path2D | パス・ツーディー | Path two D |
| PathFollow2D | パスフォロー・ツーディー | Path Follow two D |
| AudioStreamPlayer2D | オーディオストリームプレイヤー・ツーディー | Audio Stream Player two D |
| Tween | トゥイーン | Tween |
| lerp | ラープ | lerp |
| CollisionPolygon2D | コリジョンポリゴン・ツーディー | Collision Polygon two D |
| VisibleOnScreenNotifier2D | ビジブル・オン・スクリーン・ノーティファイアー・ツーディー | Visible On Screen Notifier two D |
| Parallax2D | パララックス・ツーディー | Parallax two D |
| GPUParticles2D | ジー・ピー・ユー・パーティクルズ・ツーディー | G P U particles two D |
| Line2D | ライン・ツーディー | Line two D |
| Polygon2D | ポリゴン・ツーディー | Polygon two D |
| NavigationAgent2D | ナビゲーションエージェント・ツーディー | Navigation Agent two D |
| get_tree | ゲット・ツリー | get tree |
| add_child | アド・チャイルド | add child |
| remove_child | リムーブ・チャイルド | remove child |
| set_deferred | セット・ディファード | set deferred |
| is_instance_valid | イズ・インスタンス・バリッド | is instance valid |
| load | ロード | load |
| queue_redraw | キュー・リドロー | queue redraw |
| _draw | ドロー | draw |
| draw_line | ドロー・ライン | draw line |
| lerp_angle | ラープ・アングル | lerp angle |
| clamp | クランプ | clamp |
| normalized | ノーマライズド | normalized |
| length | レングス | length |

## エラー表現16語

| モード | 表現 | 読み方 | 英語音声への入力 |
|---|---|---|---|
| pybricks | SyntaxError | シンタックス・エラー | Syntax Error |
| pybricks | NameError | ネーム・エラー | Name Error |
| pybricks | TypeError | タイプ・エラー | Type Error |
| pybricks | AttributeError | アトリビュート・エラー | Attribute Error |
| pybricks | IndentationError | インデンテーション・エラー | Indentation Error |
| pybricks | IndexError | インデックス・エラー | Index Error |
| pybricks | ZeroDivisionError | ゼロ・ディビジョン・エラー | Zero Division Error |
| pybricks | ImportError | インポート・エラー | Import Error |
| godot | Parse Error | パース・エラー | Parse Error |
| godot | Invalid call | インバリッド・コール | Invalid call |
| godot | Invalid access | インバリッド・アクセス | Invalid access |
| godot | Identifier not declared | アイデンティファイア・ノット・ディクレアード | Identifier not declared |
| godot | Node not found | ノード・ノット・ファウンド | Node not found |
| godot | Invalid assignment | インバリッド・アサインメント | Invalid assignment |
| godot | Out of bounds | アウト・オブ・バウンズ | Out of bounds |
| godot | Stack overflow | スタック・オーバーフロー | Stack overflow |

## 問題72問の全件一覧

正答・誤答・前提条件・修正例・解説を確認済み。コード診断の誤答には文法的には正しくても指定された目的を満たさないものを含む。

| ID | タイトル | 種類 |
|---|---|---|
| pb-colon | ifの最後に必要な記号 | fix |
| pb-indent | 繰り返す処理の字下げ | fix |
| pb-name | speedとSpeedは同じ？ | cause |
| pb-type | 数値と文字列を足している | fix |
| pb-method | 角度を取得するメソッド名 | cause |
| pb-import | Motorが見つからない | cause |
| pb-wait | 2秒待ったつもりなのにすぐ止まる | fix |
| pb-arguments | 速度と回転角度の順番 | fix |
| pb-index | 2つ目の要素は何番？ | fix |
| pb-condition | 代入と条件を取り違えている | fix |
| pb-call | 止める行を書いたのに回り続ける | cause |
| pb-zero | 速度の計算で止まってしまう | cause |
| pybricks-error-0-reading | SyntaxError | reading |
| pybricks-error-0-meaning | SyntaxError | meaning |
| pybricks-error-0-identify | コードからエラーを選ぶ | identify |
| pybricks-error-1-reading | NameError | reading |
| pybricks-error-1-meaning | NameError | meaning |
| pybricks-error-1-identify | コードからエラーを選ぶ | identify |
| pybricks-error-2-reading | TypeError | reading |
| pybricks-error-2-meaning | TypeError | meaning |
| pybricks-error-2-identify | コードからエラーを選ぶ | identify |
| pybricks-error-3-reading | AttributeError | reading |
| pybricks-error-3-meaning | AttributeError | meaning |
| pybricks-error-3-identify | コードからエラーを選ぶ | identify |
| pybricks-error-4-reading | IndentationError | reading |
| pybricks-error-4-meaning | IndentationError | meaning |
| pybricks-error-4-identify | コードからエラーを選ぶ | identify |
| pybricks-error-5-reading | IndexError | reading |
| pybricks-error-5-meaning | IndexError | meaning |
| pybricks-error-5-identify | コードからエラーを選ぶ | identify |
| pybricks-error-6-reading | ZeroDivisionError | reading |
| pybricks-error-6-meaning | ZeroDivisionError | meaning |
| pybricks-error-6-identify | コードからエラーを選ぶ | identify |
| pybricks-error-7-reading | ImportError | reading |
| pybricks-error-7-meaning | ImportError | meaning |
| pybricks-error-7-identify | コードからエラーを選ぶ | identify |
| gd-const | constの値をあとから変えたい | fix |
| gd-func-colon | funcの行が構文エラーになる | fix |
| gd-path | あるはずのSprite2Dが見つからない | cause |
| gd-slide-args | Godot 3の移動コードを使っている | fix |
| gd-delta | 毎秒200ピクセルのつもりが遅すぎる | fix |
| gd-input-string | 入力アクション名が未定義と言われる | fix |
| gd-indent | 関数の中身が認識されない | cause |
| gd-type | 整数の得点に文字列を入れている | fix |
| gd-base-class | velocityもmove_and_slideも見つからない | cause |
| gd-connect | ボタンに関数を登録したい | fix |
| gd-null | nullの参照から位置を読もうとしている | cause |
| gd-rotation | 90度回したつもりが別の向きになる | fix |
| godot-error-0-reading | Parse Error | reading |
| godot-error-0-meaning | Parse Error | meaning |
| godot-error-0-identify | コードからエラーを選ぶ | identify |
| godot-error-1-reading | Invalid call | reading |
| godot-error-1-meaning | Invalid call | meaning |
| godot-error-1-identify | コードからエラーを選ぶ | identify |
| godot-error-2-reading | Invalid access | reading |
| godot-error-2-meaning | Invalid access | meaning |
| godot-error-2-identify | コードからエラーを選ぶ | identify |
| godot-error-3-reading | Identifier not declared | reading |
| godot-error-3-meaning | Identifier not declared | meaning |
| godot-error-3-identify | コードからエラーを選ぶ | identify |
| godot-error-4-reading | Node not found | reading |
| godot-error-4-meaning | Node not found | meaning |
| godot-error-4-identify | コードからエラーを選ぶ | identify |
| godot-error-5-reading | Invalid assignment | reading |
| godot-error-5-meaning | Invalid assignment | meaning |
| godot-error-5-identify | コードからエラーを選ぶ | identify |
| godot-error-6-reading | Out of bounds | reading |
| godot-error-6-meaning | Out of bounds | meaning |
| godot-error-6-identify | コードからエラーを選ぶ | identify |
| godot-error-7-reading | Stack overflow | reading |
| godot-error-7-meaning | Stack overflow | meaning |
| godot-error-7-identify | コードからエラーを選ぶ | identify |
