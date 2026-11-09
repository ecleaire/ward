import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { type Category, type Term } from './terms';
import { CATALOGS, CATEGORIES as CATEGORY, MODE_KEY, readMode, type ModeId } from './catalog';
import { makeQuiz, type QuizItem } from './quiz';
import CodeLab from './CodeLab';
import { EMPTY_PROGRESS, exportProgress, mergeProgress, parseProgress, readProgress, writeProgress, type Progress, type SpeechRate } from './progress';

type View = 'home' | 'words' | 'study' | 'quiz' | 'code';

const CatalogContext = createContext(CATALOGS.pybricks);
const useCatalog = () => useContext(CatalogContext);

export default function App() {
  const [mode, setMode] = useState<ModeId>(() => {
    try { return readMode(localStorage); } catch { return 'pybricks'; }
  });
  const [modeSaveError, setModeSaveError] = useState(false);
  function changeMode(next: ModeId) {
    try { localStorage.setItem(MODE_KEY, next); setModeSaveError(false); }
    catch { setModeSaveError(true); }
    setMode(next);
    window.scrollTo({ top: 0 });
  }
  return <CatalogContext.Provider value={CATALOGS[mode]}><Home key={mode} onModeChange={changeMode} modeSaveError={modeSaveError} /></CatalogContext.Provider>;
}

function Home({ onModeChange, modeSaveError }: { onModeChange: (mode: ModeId) => void; modeSaveError: boolean }) {
  const catalog = useCatalog();
  const { id: mode, terms: TERMS } = catalog;
  const [view, setView] = useState<View>('home');
  const [data, setData] = useState<Progress>(() => {
    try { return readProgress(localStorage, mode); } catch { return EMPTY_PROGRESS; }
  });
  const { known, saved, speechRate } = data;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | Category>('All');
  const [savedOnly, setSavedOnly] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [question, setQuestion] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const answerLocked = useRef(false);

  useEffect(() => {
    try { writeProgress(localStorage, data, mode); setStorageError(false); }
    catch { setStorageError(true); }
  }, [data, mode]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  useEffect(() => { document.title = `${catalog.label} Word Lab | コードで学ぶ英単語`; }, [catalog.label]);

  const filtered = useMemo(() => TERMS.filter(term => {
    const query = search.trim().toLowerCase();
    return (category === 'All' || term.category === category) && (!savedOnly || saved.includes(term.word)) &&
      (!query || `${term.word} ${term.meaning} ${term.reading}`.toLowerCase().includes(query));
  }), [category, search, savedOnly, saved, TERMS]);
  const dueTerms = useMemo(() => TERMS.filter(term => !known.includes(term.word)), [known, TERMS]);
  const studyPool = dueTerms.length ? dueTerms : TERMS;
  const studyTerm = studyPool[studyIndex % studyPool.length];
  const progress = Math.round(known.length / TERMS.length * 100);

  function startQuiz() {
    const next = makeQuiz(data.quizHistory, TERMS);
    setQuiz(next);
    setData(items => ({ ...items, quizHistory: [...items.quizHistory, ...next.map(item => item.term.word)].slice(-20) }));
    setQuestion(0); setSelected(null); setScore(0); setFinished(false); answerLocked.current = false;
  }
  function navigate(next: View) {
    if (next === 'quiz' && !quiz.length) startQuiz();
    if (next !== 'words') setSavedOnly(false);
    setView(next); window.speechSynthesis?.cancel(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function reviewSaved() { setSearch(''); setCategory('All'); setSavedOnly(true); navigate('words'); }
  function toggleSaved(word: string) { setData(items => ({ ...items, saved: items.saved.includes(word) ? items.saved.filter(item => item !== word) : [...items.saved, word] })); }
  function markKnown(word: string, value: boolean) { setData(items => ({ ...items, known: value ? [...new Set([...items.known, word])] : items.known.filter(item => item !== word) })); }
  function nextCard(remembered: boolean) {
    markKnown(studyTerm.word, remembered); setFlipped(false);
    // 習得済みにすると現在のカードが配列から抜けるため、次の未習得語を飛ばさない。
    if (!remembered || !dueTerms.length) setStudyIndex(value => value + 1);
  }
  function answer(choice: string) {
    if (answerLocked.current) return;
    answerLocked.current = true; setSelected(choice);
    if (choice === quiz[question].term.meaning) { setScore(value => value + 1); markKnown(quiz[question].term.word, true); }
  }
  function nextQuestion() {
    if (question === quiz.length - 1) { setFinished(true); return; }
    setQuestion(value => value + 1); setSelected(null); answerLocked.current = false;
  }
  function speak(word: string) {
    if (!('speechSynthesis' in window)) { setNotice('このブラウザーは音声再生に対応していません。'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US'; utterance.rate = speechRate === 'slow' ? 0.65 : 1;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(item => item.lang.toLowerCase().startsWith('en-us')) || voices.find(item => item.lang.toLowerCase().startsWith('en'));
    if (voice) utterance.voice = voice;
    utterance.onerror = event => { if (event.error !== 'canceled' && event.error !== 'interrupted') setNotice('音声を再生できませんでした。端末の音声設定をご確認ください。'); };
    window.speechSynthesis.speak(utterance);
  }
  function importData(incoming: Progress) {
    const merged = mergeProgress(data, incoming);
    try { writeProgress(localStorage, merged, mode); }
    catch { throw new Error('端末に保存できませんでした。ブラウザーの保存設定や空き容量をご確認ください。'); }
    setData(merged); setStudyIndex(0); setFlipped(false); setQuiz([]); setView('home');
  }

  const nav = <>
    <Nav active={view === 'home'} icon="⌂" label="ホーム" onClick={() => navigate('home')} />
    <Nav active={view === 'words'} icon="Aa" label="単語リスト" onClick={() => { setSavedOnly(false); navigate('words'); }} />
    <Nav active={view === 'study'} icon="◇" label="カード学習" onClick={() => navigate('study')} />
    <Nav active={view === 'quiz'} icon="✓" label="ミニテスト" onClick={() => navigate('quiz')} />
    <Nav active={view === 'code'} icon="</>" label="コード診断" onClick={() => navigate('code')} />
  </>;
  return <main className="app-shell" data-mode={mode}>
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate('home')} aria-label="ホームへ"><BrickMark /><span><b>{catalog.brand}</b><small>WORD LAB</small></span></button>
      <nav aria-label="メインメニュー">{nav}</nav>
      <div className="sidebar-progress"><div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as CSSProperties}><span>{progress}%</span></div><div><b>{known.length} / {TERMS.length}</b><small>習得した単語</small></div></div>
      <a className="docs-link" href={catalog.docs} target="_blank" rel="noreferrer">公式ドキュメント ↗</a>
    </aside>
    <section className="content">
      <header className="topbar"><ModeSelector value={mode} onChange={onModeChange} /><button className="mobile-brand" onClick={() => navigate('home')}><BrickMark /> WORD LAB</button><SpeechRateControl value={speechRate} onChange={value => setData(items => ({ ...items, speechRate: value }))} /><div className="topbar-stats"><span><i className="dot lime" /> {known.length} 語を習得</span><span><i className="dot coral" /> 全{TERMS.length}語</span></div></header>
      {modeSaveError && <p className="storage-warning" role="alert">モード設定を保存できませんでした。現在の画面では切り替えられます。</p>}
      {storageError && <p className="storage-warning" role="alert">学習履歴を端末に保存できません。ホームからデータを書き出して保管してください。</p>}
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="通知を閉じる">×</button></div>}
      {view === 'home' && <><HomeView progress={progress} known={known.length} saved={saved.length} onNavigate={navigate} reviewSaved={reviewSaved} /><DataTransfer data={data} onImport={importData} /></>}
      {view === 'words' && <WordsView filtered={filtered} search={search} category={category} known={known} saved={saved} savedOnly={savedOnly} setSavedOnly={setSavedOnly} setSearch={setSearch} setCategory={setCategory} toggleSaved={toggleSaved} markKnown={markKnown} speak={speak} />}
      {view === 'study' && <StudyView term={studyTerm} flipped={flipped} remaining={dueTerms.length} setFlipped={setFlipped} toggleSaved={toggleSaved} saved={saved.includes(studyTerm.word)} nextCard={nextCard} speak={speak} />}
      {view === 'code' && <CodeLab mode={mode} />}
      {view === 'quiz' && quiz.length > 0 && <QuizView quiz={quiz} question={question} selected={selected} score={score} finished={finished} answer={answer} nextQuestion={nextQuestion} restart={startQuiz} speak={speak} />}
    </section>
    <nav className="mobile-nav" aria-label="スマホメニュー">{nav}</nav>
  </main>;
}

function ModeSelector({ value, onChange }: { value: ModeId; onChange: (mode: ModeId) => void }) {
  return <div className="mode-switcher"><label htmlFor="learning-mode">学習モード</label><select id="learning-mode" value={value} onChange={event => onChange(event.target.value === 'godot' ? 'godot' : 'pybricks')}><option value="pybricks">Pybricksモード</option><option value="godot">Godotモード</option></select></div>;
}

function BrickMark() { return <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>; }
function Nav({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) { return <button className={active ? 'nav-button active' : 'nav-button'} onClick={onClick} aria-current={active ? 'page' : undefined}><span aria-hidden="true">{icon}</span>{label}</button>; }
function SpeechRateControl({ value, onChange }: { value: SpeechRate; onChange: (value: SpeechRate) => void }) { return <div className="speech-rate" aria-label="英単語の発音速度"><span>発音速度</span><div><button className={value === 'normal' ? 'active' : ''} onClick={() => onChange('normal')} aria-pressed={value === 'normal'}>普通</button><button className={value === 'slow' ? 'active' : ''} onClick={() => onChange('slow')} aria-pressed={value === 'slow'}>ゆっくり</button></div></div>; }
function SpeakButton({ word, speak, label = '発音を聞く' }: { word: string; speak: (word: string) => void; label?: string }) { return <button className="speak-button" onClick={() => speak(word)} aria-label={`${word}の${label}`} title={`${word}の${label}`}><span aria-hidden="true">▶</span>{label}</button>; }

function HomeView({ progress, known, saved, onNavigate, reviewSaved }: { progress: number; known: number; saved: number; onNavigate: (view: View) => void; reviewSaved: () => void }) {
  const catalog = useCatalog();
  const { terms: TERMS } = catalog;
  return <div className="page home-page">
    <div className="eyebrow">{catalog.brand} ENGLISH / LEVEL 01</div>
    <section className="hero"><div className="hero-copy"><span className="status-chip"><i /> READY TO LEARN</span><h1>コードで出会う英語を、<br /><em>自分のことば</em>に。</h1><p>{catalog.description}を、意味・コード例・テストの3ステップで身につけよう。</p><div className="hero-actions"><button className="primary-button" onClick={() => onNavigate('study')}>今日の学習をはじめる <span>→</span></button><button className="text-button" onClick={() => onNavigate('words')}>単語を一覧で見る</button></div></div>
      <div className="robot-panel" aria-label="今日の学習目標"><div className="coordinate">{catalog.id === 'godot' ? 'NODE · SCRIPT · 2D' : 'A1 · B2 · C3'}</div><div className="bot"><div className="bot-antenna" /><div className="bot-head"><i /><i /></div><div className="bot-body"><span>{catalog.id === 'godot' ? 'GD' : 'PB'}</span></div><div className="bot-wheel left" /><div className="bot-wheel right" /></div><div className="panel-line"><span>TODAY'S TARGET</span><b>5 WORDS</b></div></div>
    </section>
    <section className="metrics-grid"><article className="metric-card accent-lime"><span>学習の進捗</span><strong>{progress}<small>%</small></strong><div className="meter"><i style={{ width: `${progress}%` }} /></div><p>{known === TERMS.length ? '全単語を習得しました！' : `あと ${TERMS.length - known} 語でコンプリート`}</p></article><article className="metric-card"><span>習得した単語</span><strong>{known}<small> / {TERMS.length}</small></strong><p>カードやテストで習得した単語の数です。</p></article><article className="metric-card accent-coral"><span>あとで復習</span><strong>{saved}<small> words</small></strong><button onClick={reviewSaved}>チェックする →</button></article></section>
    <section className="section-block"><div className="section-heading"><div><span className="section-number">01</span><h2>学び方を選ぶ</h2></div><p>短い時間でも、毎日ひとつずつ。</p></div><div className="mode-grid"><Mode index="01" icon="Aa" title="確認する" text="単語の意味とコードでの使われ方を一覧で確認。" action="単語リストへ" onClick={() => onNavigate('words')} /><Mode index="02" icon="◇" title="覚える" text="フラッシュカードをめくって、テンポよく反復学習。" action="カード学習へ" featured onClick={() => onNavigate('study')} /><Mode index="03" icon="✓" title="テストする" text="5問のミニテストで、理解できたかすぐチェック。" action="ミニテストへ" onClick={() => onNavigate('quiz')} /><Mode index="04" icon="</>" title="直してみる" text="短いコードを読んで、エラーの原因と正しい直し方をチェック。" action="コード診断へ" onClick={() => onNavigate('code')} /></div></section>
  </div>;
}
function Mode({ index, icon, title, text, action, featured, onClick }: { index: string; icon: string; title: string; text: string; action: string; featured?: boolean; onClick: () => void }) { return <button className={featured ? 'mode-card featured' : 'mode-card'} onClick={onClick}><span className="mode-index">{index}</span><div className="mode-icon">{icon}</div><h3>{title}</h3><p>{text}</p><b>{action} →</b></button>; }

function WordsView({ filtered, search, category, known, saved, savedOnly, setSavedOnly, setSearch, setCategory, toggleSaved, markKnown, speak }: { filtered: Term[]; search: string; category: 'All' | Category; known: string[]; saved: string[]; savedOnly: boolean; setSavedOnly: (value: boolean) => void; setSearch: (value: string) => void; setCategory: (value: 'All' | Category) => void; toggleSaved: (word: string) => void; markKnown: (word: string, value: boolean) => void; speak: (word: string) => void }) {
  const catalog = useCatalog();
  return <div className="page"><PageTitle eyebrow="VOCABULARY INDEX" title="単語リスト" meta={`${filtered.length} WORDS`} /><p className="pronunciation-policy">読み方は、日本のプログラミング・技術教材で定着しているカタカナ表記を優先しています。</p><div className="word-tools"><label className="search-box"><span>⌕</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="英語・日本語で検索" aria-label="単語を検索" /></label><div className="filter-row">{(['All', ...catalog.categories] as const).map(item => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)} aria-pressed={category === item}>{item === 'All' ? 'すべて' : CATEGORY[item].label}</button>)}</div><button className={savedOnly ? 'review-filter active' : 'review-filter'} onClick={() => setSavedOnly(!savedOnly)} aria-pressed={savedOnly}>★ 復習のみ</button></div>
    <div className="word-list">{filtered.map((term, index) => <article className="word-row" key={term.word}><span className="word-count">{String(index + 1).padStart(2, '0')}</span><div className="word-main"><div className="word-labels"><Badge term={term} /><button className={saved.includes(term.word) ? 'star saved' : 'star'} onClick={() => toggleSaved(term.word)} aria-label={`${term.word}を復習リスト${saved.includes(term.word) ? 'から外す' : 'に追加'}`} aria-pressed={saved.includes(term.word)}>★</button></div><h2>{term.word}</h2><small>{term.reading}</small><SpeakButton word={term.word} speak={speak} /></div><div className="word-detail"><h3>{term.meaning}</h3><p>{term.note}</p><code>{term.code}</code></div><button className={known.includes(term.word) ? 'known-toggle known' : 'known-toggle'} onClick={() => markKnown(term.word, !known.includes(term.word))} aria-pressed={known.includes(term.word)}>{known.includes(term.word) ? '✓ 習得済み' : '覚えた'}</button></article>)}{!filtered.length && <div className="empty-state">条件に合う単語がありません。</div>}</div>
  </div>;
}

function StudyView({ term, flipped, remaining, setFlipped, toggleSaved, saved, nextCard, speak }: { term: Term; flipped: boolean; remaining: number; setFlipped: (value: boolean) => void; toggleSaved: (word: string) => void; saved: boolean; nextCard: (remembered: boolean) => void; speak: (word: string) => void }) {
  return <div className="page study-page"><PageTitle eyebrow="FLASH CARD SESSION" title="カード学習" meta={remaining ? `${remaining} TO REVIEW` : '全語習得済み / 総復習'} /><div className="study-layout"><div className="study-note"><span>HOW TO</span><h2>発音を聞いてから<br />カードをめくろう。</h2><p>英単語を見て意味を思い出したら、カードをクリック。コードの中でどう使うかまで確認できます。</p><div className="key-guide"><kbd>CLICK</kbd><small>カードをめくる</small></div></div><div className="flash-area"><div className="study-speech"><SpeakButton word={term.word} speak={speak} label="英語の発音を聞く" /></div><button className={flipped ? 'flash-card flipped' : 'flash-card'} onClick={() => setFlipped(!flipped)} aria-label={`${term.word}のカードを${flipped ? '表に戻す' : 'めくる'}`}><div className="card-top"><Badge term={term} /><span>{flipped ? 'ANSWER' : 'QUESTION'}</span></div>{!flipped ? <div className="card-front"><small>WHAT DOES THIS MEAN?</small><strong>{term.word}</strong><p>{term.reading}</p><span className="flip-hint">CLICK TO FLIP ↻</span></div> : <div className="card-back"><small>{term.word}</small><strong>{term.meaning}</strong><p>{term.note}</p><code>{term.code}</code></div>}</button><div className="study-actions"><button className="secondary-button" onClick={() => nextCard(false)}>↻ もう一度</button><button className={saved ? 'save-button saved' : 'save-button'} onClick={() => toggleSaved(term.word)} aria-label={`${term.word}を復習リスト${saved ? 'から外す' : 'に追加'}`} aria-pressed={saved}>★</button><button className="primary-button" onClick={() => nextCard(true)}>覚えた ✓</button></div></div></div></div>;
}

function QuizView({ quiz, question, selected, score, finished, answer, nextQuestion, restart, speak }: { quiz: QuizItem[]; question: number; selected: string | null; score: number; finished: boolean; answer: (choice: string) => void; nextQuestion: () => void; restart: () => void; speak: (word: string) => void }) {
  const catalog = useCatalog();
  if (finished) return <div className="page quiz-page"><div className="result-card"><span className="result-kicker">SESSION COMPLETE</span><div className="result-score">{score}<small>/ 5</small></div><h1>{score === 5 ? 'PERFECT!' : score >= 3 ? 'GOOD JOB!' : 'KEEP GOING!'}</h1><p>{score === 5 ? `全問正解です。${catalog.label}の英語がしっかり身についています。` : '間違えた単語はカード学習でもう一度確認してみましょう。'}</p><button className="primary-button" onClick={restart}>別の5問に挑戦 →</button></div></div>;
  const current = quiz[question]; const isCorrect = selected === current.term.meaning;
  return <div className="page quiz-page"><PageTitle eyebrow="QUICK CHECK / 5 QUESTIONS" title="ミニテスト" meta={`SCORE ${score}`} /><div className="quiz-progress"><i style={{ width: `${((question + 1) / quiz.length) * 100}%` }} /><span>{question + 1} / {quiz.length}</span></div><p className="quiz-history-note">↻ 直近20問と重なりにくい問題を選んでいます</p><section className="quiz-card"><div className="quiz-question"><span>QUESTION {String(question + 1).padStart(2, '0')}</span><small>次の英単語の意味を選んでください</small><h2>{current.term.word}</h2><p>{current.term.reading}</p><SpeakButton word={current.term.word} speak={speak} /></div><div className="choice-grid">{current.choices.map((choice, index) => { const cls = !selected ? 'choice' : choice === current.term.meaning ? 'choice correct' : choice === selected ? 'choice wrong' : 'choice muted'; return <button className={cls} key={choice} onClick={() => answer(choice)} disabled={selected !== null}><span>{String.fromCharCode(65 + index)}</span>{choice}</button>; })}</div>{selected && <div className={isCorrect ? 'answer-feedback correct' : 'answer-feedback wrong'} role="status"><div><b>{isCorrect ? '✓ 正解！' : '× おしい！'}</b><p>{current.term.note}</p></div><button onClick={nextQuestion}>{question === quiz.length - 1 ? '結果を見る' : '次の問題'} →</button></div>}</section></div>;
}
function Badge({ term }: { term: Term }) { return <span className="category-badge" style={{ '--badge': CATEGORY[term.category].color } as CSSProperties}>{CATEGORY[term.category].label}</span>; }
function PageTitle({ eyebrow, title, meta }: { eyebrow: string; title: string; meta: string }) { return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div><span>{meta}</span></div>; }

function DataTransfer({ data, onImport }: { data: Progress; onImport: (data: Progress) => void }) {
  const { id: mode, label } = useCatalog();
  const [pending, setPending] = useState<Progress | null>(null);
  const [message, setMessage] = useState('');
  const [legacyText, setLegacyText] = useState('');
  function prepare(text: string) {
    setPending(null);
    try { if (text.length > 1_000_000) throw new Error('ファイルが大きすぎます。'); setPending(parseProgress(JSON.parse(text), mode)); setMessage(''); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'データを読み込めませんでした。'); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportProgress(data, mode)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `${mode}-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage('学習データを書き出しました。');
  }
  return <section className="page transfer-page" aria-labelledby="transfer-title"><div className="transfer-panel"><h2 id="transfer-title">学習データの引き継ぎ</h2><p className="transfer-mode">{label}モードのデータ</p><p>習得・★復習・直近20問・発音速度をファイルに保存できます。別の端末や新しいサイトで読み込むと、今の履歴に追加されます。発音速度は読み込んだ設定になります。</p><div className="transfer-actions"><button className="secondary-button" onClick={download}>データを書き出す</button><label className="file-button">ファイルを読み込む<input type="file" accept=".json,application/json" aria-label="学習データファイル" onChange={async event => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; if (file.size > 1_000_000) { setPending(null); setMessage('ファイルが大きすぎます。'); return; } try { prepare(await file.text()); } catch { setPending(null); setMessage('ファイルを読み取れませんでした。'); } }} /></label></div>
    {mode === 'pybricks' && <details><summary>旧サイトから履歴を移すには</summary><p>旧サイトと新サイトの保存場所は別です。旧サイトに書き出しボタンがない場合は、履歴がある端末の旧サイトを開き、ブラウザーの開発者ツールのコンソールで以下を実行してください。表示されたJSONをコピーして下へ貼り付けます。旧サイトのデータは変更しません。</p><pre><code>{`JSON.stringify({
  "pybricks-known": localStorage.getItem("pybricks-known") || "[]",
  "pybricks-saved": localStorage.getItem("pybricks-saved") || "[]",
  "pybricks-quiz-history": localStorage.getItem("pybricks-quiz-history") || "[]",
  "pybricks-speech-rate": localStorage.getItem("pybricks-speech-rate") || "normal"
})`}</code></pre><label htmlFor="legacy-data">旧サイトのJSON</label><textarea id="legacy-data" value={legacyText} onChange={event => setLegacyText(event.target.value)} rows={5} /><button className="secondary-button" onClick={() => prepare(legacyText)}>貼り付けたデータを確認</button></details>}
    {pending && <div className="import-preview"><p>読み込み内容：習得 {pending.known.length}語・★復習 {pending.saved.length}語・出題履歴 {pending.quizHistory.length}問・発音 {pending.speechRate === 'slow' ? 'ゆっくり' : '普通'}</p><button className="primary-button" onClick={() => { try { onImport(pending); setPending(null); setLegacyText(''); setMessage('学習データを読み込みました。'); } catch (error) { setMessage(error instanceof Error ? error.message : '保存できませんでした。'); } }}>このデータを追加する</button><button className="text-button" onClick={() => setPending(null)}>キャンセル</button></div>}
    <p role="status">{message}</p></div></section>;
}
