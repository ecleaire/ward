import type { ModeId } from './catalog';
import { exercise, type CodeExercise } from './code-exercises';

export type ErrorTerm = { word: string; reading: string; meaning: string; note: string; context: string; code: string; correctedCode: string; alternatives: [string, string, string] };
export const ERROR_TERMS: Record<ModeId, ErrorTerm[]> = {
  pybricks: [
    { word: 'SyntaxError', reading: 'シンタックス・エラー', meaning: '文法や記号の書き方が正しくない', note: 'Syntaxは構文という意味。コロンや括弧などを確認します。より具体的な種類のエラー名がある場合はそちらを使います。', context: 'PybricksのPythonです。ifの末尾に必要な記号がありません。', code: 'if True\n    print("Hello")', correctedCode: 'if True:\n    print("Hello")', alternatives: ['NameError', 'TypeError', 'ImportError'] },
    { word: 'NameError', reading: 'ネーム・エラー', meaning: '使おうとした名前が定義されていない', note: 'Nameは名前。変数名のつづり、大文字・小文字、定義した場所を確認します。', context: '次の2行だけを書きました。speedとSpeedは別の名前です。', code: 'speed = 300\nprint(Speed)', correctedCode: 'speed = 300\nprint(speed)', alternatives: ['TypeError', 'IndexError', 'ZeroDivisionError'] },
    { word: 'TypeError', reading: 'タイプ・エラー', meaning: '操作や引数に合わない型の値を使っている', note: 'Typeは型。文字列と数値をそのまま足すなど、型が合わない操作で発生します。', context: '引用符で囲まれた数と整数を足しています。', code: 'speed = "300"\nprint(speed + 100)', correctedCode: 'speed = 300\nprint(speed + 100)', alternatives: ['NameError', 'IndexError', 'ImportError'] },
    { word: 'AttributeError', reading: 'アトリビュート・エラー', meaning: '属性やメソッドが対象に見つからない', note: 'Attributeは属性。メソッドのつづりや、対象が想定した種類のオブジェクトかを確認します。', context: 'motorは正しく初期化されたPybricksのMotorです。角度を取得するメソッド名はangleです。', code: 'current = motor.angel()', correctedCode: 'current = motor.angle()', alternatives: ['IndexError', 'ZeroDivisionError', 'ImportError'] },
    { word: 'IndentationError', reading: 'インデンテーション・エラー', meaning: '字下げが足りない、またはそろっていない', note: 'Indentationは字下げ。SyntaxErrorの一種ですが、字下げの誤りを具体的に示す名前です。', context: '繰り返す処理の字下げがありません。最も具体的なエラー名を選びます。', code: 'for index in range(3):\nprint(index)', correctedCode: 'for index in range(3):\n    print(index)', alternatives: ['NameError', 'AttributeError', 'TypeError'] },
    { word: 'IndexError', reading: 'インデックス・エラー', meaning: '配列などの要素の番号が範囲外である', note: 'Indexは要素の番号。2要素のリストで使える番号は0と1です。', context: 'リストの3番目を読もうとしていますが、要素は2個です。', code: 'values = [10, 20]\nprint(values[2])', correctedCode: 'values = [10, 20]\nprint(values[1])', alternatives: ['TypeError', 'NameError', 'ZeroDivisionError'] },
    { word: 'ZeroDivisionError', reading: 'ゼロ・ディビジョン・エラー', meaning: 'ゼロで割ろうとしている', note: 'Zeroはゼロ、Divisionは割り算。割る数が0になっていないか確認します。', context: '距離を時間で割っていますが、時間が0です。', code: 'distance = 500\ntime = 0\nprint(distance / time)', correctedCode: 'distance = 500\ntime = 2\nprint(distance / time)', alternatives: ['SyntaxError', 'AttributeError', 'ImportError'] },
    { word: 'ImportError', reading: 'インポート・エラー', meaning: 'モジュールや指定した機能を読み込めない', note: 'Importは読み込み。モジュール名や、読み込む名前が実際に存在するかを確認します。', context: 'PybricksのparametersにはMissingConstantという名前はありません。', code: 'from pybricks.parameters import MissingConstant', correctedCode: 'from pybricks.parameters import Port', alternatives: ['ZeroDivisionError', 'IndexError', 'AttributeError'] },
  ],
  godot: [
    { word: 'Parse Error', reading: 'パース・エラー', meaning: 'スクリプトの構文を解析できない', note: 'Parseは構文を解析すること。関数定義やコロン、字下げなどを確認します。', context: 'Godot 4のGDScriptです。関数定義の末尾に必要な記号がありません。', code: 'func _ready()\n    print("Ready")', correctedCode: 'func _ready():\n    print("Ready")', alternatives: ['Node not found', 'Stack overflow', 'Invalid call'] },
    { word: 'Invalid call', reading: 'インバリッド・コール', meaning: '関数やメソッドの呼び出しが適切でない', note: 'Invalidは無効な・不適切な、callは呼び出し。存在しない関数や引数などを確認します。', context: 'Node2Dにはflyというメソッドがありません。そのメソッドをcallで呼ぼうとしています。次は関数内のコードです。', code: 'var target: Object = Node2D.new()\ntarget.call("fly")', correctedCode: 'var target: Object = Node2D.new()\ntarget.call("show")', alternatives: ['Node not found', 'Stack overflow', 'Identifier not declared'] },
    { word: 'Invalid access', reading: 'インバリッド・アクセス', meaning: '対象の値やプロパティを適切に参照できない', note: 'Accessはアクセス・参照。nullや解放済みの参照などに注意します。エラー文のbaseや型名も手がかりになります。', context: 'playerはnullで、ノードが入っていません。位置の参照に失敗する例です。次は関数内のコードです。', code: 'var player: Node2D = null\nprint(player.position)', correctedCode: 'var player: Node2D = null\nif is_instance_valid(player):\n    print(player.position)', alternatives: ['Stack overflow', 'Node not found', 'Identifier not declared'] },
    { word: 'Identifier not declared', reading: 'アイデンティファイア・ノット・ディクレアード', meaning: '識別子が宣言されていない', note: 'Identifierは識別子、declaredは宣言された。実際の文ではIdentifierの後に変数名などが入ります。', context: 'ほかにspeedの宣言はありません。エラー文の「未宣言の名前」を表す部分を選びます。', code: 'func _ready():\n    print(speed)', correctedCode: 'var speed = 200.0\n\nfunc _ready():\n    print(speed)', alternatives: ['Node not found', 'Stack overflow', 'Invalid call'] },
    { word: 'Node not found', reading: 'ノード・ノット・ファウンド', meaning: '指定したパスのノードが見つからない', note: 'Not foundは見つからない。ノード名の大文字・小文字、親子関係、参照するタイミングを確認します。', context: '直下の子ノードの名前はSprite2Dです。get_nodeで指定したパスが間違っています。', code: '@onready var sprite = get_node("Sprite2d")', correctedCode: '@onready var sprite = get_node("Sprite2D")', alternatives: ['Stack overflow', 'Invalid assignment', 'Out of bounds'] },
    { word: 'Invalid assignment', reading: 'インバリッド・アサインメント', meaning: '代入先と値の型などが合っていない', note: 'Assignmentは代入。値を入れる側の型と、入れようとしている値を確認します。実際には型やプロパティ名を含む説明が続きます。', context: 'Godot 4で整数の得点を宣言しています。数値を入れる場所に文字列を代入する誤りです。エラー文の「不適切な代入」を表す部分を選びます。', code: 'var score: int = "ten"', correctedCode: 'var score: int = 10', alternatives: ['Node not found', 'Stack overflow', 'Out of bounds'] },
    { word: 'Out of bounds', reading: 'アウト・オブ・バウンズ', meaning: '配列などで指定した番号が有効範囲の外にある', note: 'Boundsは境界・範囲。配列のサイズと添字を確認します。バージョンによってはInvalid access of indexなど別の表現でも示されます。', context: '要素が2個の配列で、範囲外の番号を指定しています。次は関数内のコードです。', code: 'var values = [10, 20]\nprint(values[3])', correctedCode: 'var values = [10, 20]\nprint(values[1])', alternatives: ['Node not found', 'Stack overflow', 'Identifier not declared'] },
    { word: 'Stack overflow', reading: 'スタック・オーバーフロー', meaning: '関数の呼び出しが深く重なりすぎている', note: 'Stackは呼び出しの記録などを積む領域。終了条件のない再帰呼び出しなどが原因になります。', context: '_readyが自分自身を終了条件なしで何度も呼んでいます。', code: 'func _ready():\n    _ready()', correctedCode: 'func _ready():\n    print("Ready")', alternatives: ['Node not found', 'Out of bounds', 'Invalid assignment'] },
  ],
};

function buildExercises(mode: ModeId): CodeExercise[] {
  const terms = ERROR_TERMS[mode];
  return terms.flatMap((term, index) => {
    const others = terms.filter(other => other.word !== term.word);
    const base = { context: term.context, code: term.code, error: 'コードと前提条件を確認しましょう', correctedCode: term.correctedCode, related: [term.word], errorTerm: { word: term.word, reading: term.reading, meaning: term.meaning, note: term.note } };
    return [
      exercise({ ...base, id: `${mode}-error-${index}-reading`, kind: 'reading', title: term.word, prompt: 'このエラー名・表現の読み方はどれですか？', options: [term.reading, ...others.slice(0, 3).map(other => other.reading)] as [string, string, string, string], explanation: `${term.word}は「${term.reading}」と読みます。${term.note}` }),
      exercise({ ...base, id: `${mode}-error-${index}-meaning`, kind: 'meaning', title: term.word, prompt: 'このエラー名・表現の意味はどれですか？', options: [term.meaning, ...others.slice(0, 3).map(other => other.meaning)] as [string, string, string, string], explanation: `${term.word}は「${term.meaning}」という意味です。${term.note}` }),
      exercise({ ...base, id: `${mode}-error-${index}-identify`, kind: 'identify', title: 'コードからエラーを選ぶ', prompt: mode === 'pybricks' ? 'このコードで生じる、最も具体的なエラー名はどれですか？' : 'この誤りの説明に合う、エラー文の表現はどれですか？', options: [term.word, ...term.alternatives], explanation: `${term.word}（${term.reading}）は「${term.meaning}」を表します。${term.note}` }),
    ];
  });
}
export const ERROR_EXERCISES: Record<ModeId, CodeExercise[]> = { pybricks: buildExercises('pybricks'), godot: buildExercises('godot') };
