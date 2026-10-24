import { useCallback, useEffect, useState } from 'react';
import { CheatCard } from './CheatCard';
import { Collection } from './Collection';
import { Diagram } from './Diagram';
import { Practice } from './Practice';
import { lessonIds, lessons, numberText } from './lessons';
import type { LessonId } from './lessons';
import { freshProgress } from './progress';
import type { LessonProgress } from './progress';
import { usePlayback } from './usePlayback';

type Stage = 'watch' | 'card' | 'practice';

export function App() {
  const [selection, setSelection] = useState({ id: 2 as LessonId, revision: 0, card: false });
  const [progress, setProgress] = useState<Record<LessonId, LessonProgress>>({ 2: freshProgress(), 3: freshProgress() });
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const n = selection.id, total = progress[2].solved + progress[3].solved;

  const updateProgress = useCallback((id: LessonId, update: Partial<LessonProgress>) => {
    setProgress(current => ({ ...current, [id]: { ...current[id], ...update } }));
  }, []);
  const markViewed = useCallback((id: LessonId, step: number) => {
    setProgress(current => current[id].viewed.includes(step) ? current
      : { ...current, [id]: { ...current[id], viewed: [...current[id].viewed, step] } });
  }, []);

  function switchLesson(id: LessonId, card = false) {
    setSelection(current => ({ id, revision: current.revision + 1, card }));
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  return <>
    <header className="topbar">
      <a className="brand" href="#" aria-label="Вижу — решаю, на главную" onClick={event => { event.preventDefault(); switchLesson(2); }}><span className="brand-mark" aria-hidden="true">↗</span> вижу<span className="brand-arrow">→</span>решаю</a>
      <span className="top-label">МАЛЕНЬКИЕ УРОКИ. НОВЫЕ УМЕНИЯ.</span>
      <button className="collection-trigger" id="collectionButton" onClick={() => setCollectionOpen(true)}><span aria-hidden="true">▱</span> Мои карточки <span id="cardCount">{Number(progress[2].card) + Number(progress[3].card)} / 2</span></button>
    </header>
    <div className="app-layout">
      <aside className="sidebar">
        <div className="eyebrow">МАТЕМАТИКА / ГЛАВА 01</div>
        <h1>Определители<br />матриц<span className="title-dot">.</span></h1>
        <p className="sidebar-description">Увидеть приём.<br />Сохранить схему.<br />Попробовать самому.</p>
        <nav className="lesson-list" aria-label="Уроки">{lessonIds.map(id => <button key={id} className={`lesson-button${n === id ? ' active' : ''}`} data-lesson={id} aria-current={n === id ? 'page' : 'false'} onClick={() => switchLesson(id)}>
          <span className="lesson-symbol">{id}<span>×</span>{id}</span><span className="lesson-copy"><strong>{lessons[id].name}</strong><small>Определитель {id} × {id}</small></span>
          <span className="lesson-status" id={`status${id}`}>{progress[id].completed ? '✓' : progress[id].card ? '▱' : id === 2 ? '01' : '02'}</span>
        </button>)}</nav>
        <div className="journey"><div className="journey-top"><span>ТВОЙ ПУТЬ</span><span id="totalProgress">{total} / 6 задач</span></div><div className="progress-track"><div id="overallProgress" style={{ width: `${total / 6 * 100}%` }} /></div><p>Шпаргалка всегда под рукой.<br />Подсматривай столько, сколько нужно.</p></div>
        <div className="sidebar-bottom"><span className="little-star">✳</span><span>Один понятный шаг<br />за другим.</span></div>
      </aside>
      <LessonView key={selection.revision} lessonId={n} initialCard={selection.card} progress={progress[n]} otherDone={progress[n === 2 ? 3 : 2].completed} collectionOpen={collectionOpen}
        onProgress={updateProgress} onViewed={markViewed} onOtherLesson={() => switchLesson(n === 2 ? 3 : 2)} onToast={message => setToast({ message })} />
    </div>
    <Collection open={collectionOpen} progress={progress} onClose={() => setCollectionOpen(false)} onCard={id => switchLesson(id, true)} />
    <div id="toast" className={`toast${toast ? ' visible' : ''}`} role="status" aria-live="polite">{toast?.message}</div>
  </>;
}

interface LessonViewProps {
  lessonId: LessonId;
  initialCard: boolean;
  progress: LessonProgress;
  otherDone: boolean;
  collectionOpen: boolean;
  onProgress: (lessonId: LessonId, update: Partial<LessonProgress>) => void;
  onViewed: (lessonId: LessonId, step: number) => void;
  onOtherLesson: () => void;
  onToast: (message: string) => void;
}

function LessonView({ lessonId: n, initialCard, progress: p, otherDone, collectionOpen, onProgress, onViewed, onOtherLesson, onToast }: LessonViewProps) {
  const [stage, setStage] = useState<Stage>(initialCard ? 'card' : 'watch');
  const playback = usePlayback(n);
  const { frames, step, playing, revision, diagramRef, goTo, toggle, pause } = playback;
  const lesson = lessons[n], frame = frames[step];

  function switchStage(next: Stage) {
    pause();
    if (next === 'card' && !p.card) {
      onProgress(n, { card: true });
      onToast('Карточка добавлена в твою коллекцию.');
    }
    setStage(next);
  }

  useEffect(() => { onViewed(n, step); }, [n, step, onViewed]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (stage !== 'watch' || collectionOpen || (event.target instanceof Element && event.target.matches('input,button'))) return;
      if (event.key === 'ArrowRight' && step < frames.length - 1) { event.preventDefault(); goTo(step + 1); }
      if (event.key === 'ArrowLeft' && step > 0) { event.preventDefault(); goTo(step - 1); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stage, collectionOpen, step, frames.length, goTo]);

  return <main id="mainContent">
    <div className="content-top"><div className="breadcrumb">МАТЕМАТИКА <span>/</span> <span id="lessonCrumb">МАТРИЦЫ {n} × {n}</span></div><span className="prototype-badge">ПЕРВАЯ ВЕРСИЯ</span></div>
    <div className="lesson-heading"><div><div className="eyebrow" id="lessonIndex">УРОК 0{n === 2 ? 1 : 2} · ОПРЕДЕЛИТЕЛЬ {n} × {n}</div><h2 id="lessonTitle">{lesson.title[0]}<br />{lesson.title[1]}</h2></div><p id="lessonDescription">{lesson.description[0]}<br />{lesson.description[1]}</p></div>
    <nav className="stage-tabs" aria-label="Этапы урока">
      <button data-stage="watch" className={stage === 'watch' ? 'active' : ''} aria-current={stage === 'watch' ? 'step' : 'false'} onClick={() => switchStage('watch')}><span>01</span> Смотрю</button>
      <button data-stage="card" className={stage === 'card' ? 'active' : ''} aria-current={stage === 'card' ? 'step' : 'false'} onClick={() => switchStage('card')}><span>02</span> Забираю карточку <span className="tab-lock" id="cardLock">{p.card ? '✓' : ''}</span></button>
      <button data-stage="practice" className={stage === 'practice' ? 'active' : ''} aria-current={stage === 'practice' ? 'step' : 'false'} onClick={() => switchStage('practice')}><span>03</span> Решаю <span className="tab-lock" id="practiceLock">{p.completed ? '✓' : ''}</span></button>
    </nav>
    <section id="watchPanel" className="stage-panel" aria-label="Объяснение способа" hidden={stage !== 'watch'}>
      <div className="animation-card">
        <div className="canvas-head"><span className="pill"><span className="live-dot" /> ВИЗУАЛЬНЫЙ РАЗБОР</span><div className="canvas-actions">
          <button id="startAnimation" className="animation-start" aria-pressed={playing} onClick={toggle}>{playing ? 'Ⅱ Пауза' : step === 0 ? '▶ Смотреть' : step === frames.length - 1 ? '↻ Ещё раз' : '▶ Продолжить'}</button>
          <span id="frameCounter">{String(step + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}</span>
        </div></div>
        <div className="visual-stage"><div id="mainDiagram" className="main-diagram" ref={diagramRef}><Diagram key={`${step}-${revision}`} matrix={lesson.example} paths={frame.paths} /></div>
          <div className="step-explanation"><div className="step-kicker" id="stepKicker">{frame.kicker}</div><h3 id="stepTitle">{frame.title}</h3><p id="stepText">{frame.text}</p>
            <div id="stepExpression" className={`step-expression${frame.negative ? ' negative' : ''}`}>{frame.expression}{frame.result !== undefined && <span className="result">{numberText(frame.result)}</span>}</div>
          </div>
        </div>
        <div className="animation-footer">
          <button id="playButton" className="play-button" aria-label={playing ? 'Поставить на паузу' : 'Запустить анимацию'} aria-pressed={playing} onClick={toggle}>{playing ? 'Ⅱ' : '▶'}</button>
          <div className="timeline" id="timeline" aria-label="Шаги объяснения">{frames.map((_, i) => <button key={i} className={i === step ? 'current' : p.viewed.includes(i) ? 'passed' : ''} data-frame={i} aria-label={`Шаг ${i + 1}`} aria-current={i === step ? 'step' : undefined} onClick={() => goTo(i)} />)}</div>
          <span className="animation-hint">В твоём темпе</span><button id="previousStep" className="icon-button" aria-label="Предыдущий шаг" disabled={step === 0} onClick={() => goTo(step - 1)}>←</button>
          <button id="nextStep" className="icon-button next-button" aria-label="Следующий шаг" disabled={step === frames.length - 1} onClick={() => goTo(step + 1)}>→</button>
        </div>
      </div>
      <div className="below-canvas"><p><span aria-hidden="true">↳</span> Можно поставить на паузу и вернуться к любому шагу.</p><button id="collectCard" className="primary-button" onClick={() => switchStage('card')}>{p.card ? 'Открыть карточку' : 'Забрать карточку'} <span>↗</span></button></div>
    </section>
    <section id="cardPanel" className="stage-panel" aria-label="Шпаргалка" hidden={stage !== 'card'}>
      <div className="card-intro"><div><h3>Весь приём — в одной карточке</h3><p>Это схема из разбора. Она останется доступной в задачах.</p></div><span className="earned-badge">✓ В КОЛЛЕКЦИИ</span></div>
      <CheatCard lessonId={n} /><div className="card-actions"><p>Приготовь бумагу или открой привычный редактор. Дальше попробуешь сам.</p><button className="primary-button" id="startPractice" onClick={() => switchStage('practice')}>Перейти к задачам <span>↗</span></button></div>
    </section>
    <section id="practicePanel" className="stage-panel" aria-label="Самостоятельные задачи" hidden={stage !== 'practice'}>
      <Practice lessonId={n} progress={p} otherDone={otherDone} onProgress={update => onProgress(n, update)} onReview={() => { goTo(0); switchStage('watch'); }} onCard={() => switchStage('card')} onOtherLesson={onOtherLesson} />
    </section>
    <footer className="content-footer"><span>ПОНЯТЬ → ПОПРОБОВАТЬ → УМЕТЬ</span><span>Можно решать на бумаге или в любом редакторе.</span></footer>
  </main>;
}
