import { useEffect, useRef, useState } from 'react';
import { CATALOGS, type ModeId } from './catalog';
import { makeCodeSession, type CodeExercise } from './code-exercises';
import './code-lab.css';

type Session = { questions: CodeExercise[]; index: number; answers: Record<string, string>; finished: boolean; review: boolean };
function createSession(questions: CodeExercise[], review = false): Session { return { questions, index: 0, answers: {}, finished: false, review }; }

export default function CodeLab({ mode }: { mode: ModeId }) {
  const [session, setSession] = useState(() => createSession(makeCodeSession(mode)));
  const title = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLElement>(null);
  const question = session.questions[session.index];
  const selected = session.answers[question.id];
  const correct = selected === question.correctId;
  const score = session.questions.filter(item => session.answers[item.id] === item.correctId).length;
  const wrong = session.questions.filter(item => session.answers[item.id] !== item.correctId);

  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [session.index, session.finished, session.questions]);
  useEffect(() => { if (selected && !session.finished) feedback.current?.focus(); }, [selected, session.finished]);

  function answer(choiceId: string) {
    setSession(current => {
      if (current.finished || current.questions[current.index].id !== question.id || current.answers[question.id]) return current;
      return { ...current, answers: { ...current.answers, [question.id]: choiceId } };
    });
  }
  function next() {
    setSession(current => {
      if (current.finished || current.questions[current.index].id !== question.id || !current.answers[question.id]) return current;
      return current.index === current.questions.length - 1 ? { ...current, finished: true } : { ...current, index: current.index + 1 };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function restart(review = false) {
    const questions = review ? makeCodeSession(mode, [], wrong) : makeCodeSession(mode, session.questions.map(item => item.id));
    setSession(createSession(questions, review));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <div className="page code-lab">
    <div className="page-title"><div><div className="eyebrow">{CATALOGS[mode].brand} / CODE CHECK</div><h1 ref={title} tabIndex={-1}>コード診断</h1></div><span>{session.review ? '間違えた問題の復習' : '短いコードで5問'}</span></div>
    {session.finished ? <>
      <section className="debug-result" aria-labelledby="debug-result-title">
        <span className="result-kicker">CODE CHECK COMPLETE</span><h2 id="debug-result-title">診断の結果</h2><div className="result-score" aria-label={`${session.questions.length}問中${score}問正解`}>{score}<small> / {session.questions.length}</small></div>
        <p>{score === session.questions.length ? '全問正解！コードの読み方と直し方を確認できました。' : '間違えた問題は、修正コードと理由を読み返してみましょう。'}</p>
        <div className="debug-result-actions">{wrong.length > 0 && <button className="primary-button" onClick={() => restart(true)}>間違えた{wrong.length}問を復習</button>}<button className="secondary-button" onClick={() => restart()}>別の5問に挑戦</button></div>
      </section>
      <section className="debug-review" aria-labelledby="debug-review-title"><h2 id="debug-review-title">今回の振り返り</h2>{session.questions.map(item => {
        const right = session.answers[item.id] === item.correctId;
        return <details key={item.id} open={!right} className={right ? 'review-correct' : 'review-wrong'}><summary>{right ? '✓ 正解' : '× 要復習'}：{item.title}</summary><p>{item.context}</p><p>{item.prompt}</p><CodeBlock label="問題のコード" code={item.code} /><p>選んだ答え：<code>{item.choices.find(choice => choice.id === session.answers[item.id])?.text}</code></p><p>正しい答え：<code>{item.choices.find(choice => choice.id === item.correctId)?.text}</code></p><p>{item.explanation}</p><CodeBlock label="修正コード" code={item.correctedCode} /></details>;
      })}</section>
    </> : <>
      <p className="debug-intro">短いコードを読んで、エラーの原因や正しい書き直しを選びましょう。回答後に修正コードと理由を確認できます。</p>
      <div className="debug-progress"><span>第{session.index + 1}問 / {session.questions.length}問</span><span>現在 {score}問正解</span></div>
      <progress max={session.questions.length} value={session.index + 1} aria-label="コード診断の進み具合" />
      <article className="debug-question" data-question-id={question.id}>
        <div className="debug-kind">{question.kind === 'fix' ? '書き直しを選ぶ' : '原因を見つける'}</div><h2>{question.title}</h2><p className="debug-context">{question.context}</p>
        <CodeBlock label="問題のコード" code={question.code} /><p className="debug-error"><b>チェックの手がかり</b><span>{question.error}</span></p><h3 className="debug-prompt">{question.prompt}</h3>
        <div className="debug-choices" role="group" aria-label="コード診断の選択肢">{question.choices.map((choice, index) => {
          const result = !selected ? '' : choice.id === question.correctId ? ' correct' : choice.id === selected ? ' wrong' : ' muted';
          return <button key={choice.id} className={`debug-choice${result}`} data-choice-id={choice.id} disabled={Boolean(selected)} onClick={() => answer(choice.id)}><span className="debug-letter">{String.fromCharCode(65 + index)}</span><span className="debug-choice-body">{question.kind === 'fix' ? <code>{choice.text}</code> : choice.text}{selected && choice.id === question.correctId && <b className="debug-answer-label">✓ 正しい答え</b>}{selected && choice.id === selected && !correct && <b className="debug-answer-label">× 選んだ答え</b>}</span></button>;
        })}</div>
        {selected && <section className={`debug-feedback ${correct ? 'correct' : 'wrong'}`} ref={feedback} tabIndex={-1} aria-label="コード診断の解説" aria-live="polite"><h3>{correct ? '✓ 正解！' : '× もう一歩！'}</h3><p>{question.explanation}</p><CodeBlock label="修正コード" code={question.correctedCode} /><p className="debug-related">関連する単語：{question.related.join(' / ')}</p><button className="primary-button" onClick={next}>{session.index === session.questions.length - 1 ? '結果を見る' : '次の問題へ'} →</button></section>}
      </article>
    </>}
  </div>;
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return <div className="debug-code"><span>{label}</span><pre tabIndex={0} aria-label={label}><code>{code}</code></pre></div>;
}

