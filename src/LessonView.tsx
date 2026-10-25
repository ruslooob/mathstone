import { useEffect, useState } from 'react';
import ui from './ui.module.css';
import styles from './LessonView.module.css';
import CheatCard from './CheatCard';
import Diagram from './Diagram';
import Practice from './Practice';
import { lessons, numberText } from './lessons';
import type { LessonId } from './lessons';
import type { LessonProgress, ProgressUpdate } from './progress';
import usePlayback from './usePlayback';

type Stage = 'watch' | 'card' | 'practice';

function playbackLabel(playing: boolean, step: number, lastStep: number) {
  if (playing) return 'Ⅱ Пауза';
  if (step === 0) return '▶ Смотреть';
  if (step === lastStep) return '↻ Ещё раз';
  return '▶ Продолжить';
}

function frameStatus(index: number, step: number, viewed: readonly number[]) {
  if (index === step) return styles.current;
  return viewed.includes(index) ? styles.passed : undefined;
}

interface LessonViewProps {
  lessonId: LessonId;
  initialCard: boolean;
  progress: LessonProgress;
  collectionOpen: boolean;
  onProgress: (lessonId: LessonId, update: ProgressUpdate) => void;
  onViewed: (lessonId: LessonId, step: number) => void;
  onToast: (message: string) => void;
}

export default function LessonView({
  lessonId,
  initialCard,
  progress,
  collectionOpen,
  onProgress,
  onViewed,
  onToast,
}: LessonViewProps) {
  const [stage, setStage] = useState<Stage>(initialCard ? 'card' : 'watch');
  const playback = usePlayback(lessonId);
  const {
    frames, step, playing, revision, diagramRef, goTo, toggle, pause,
  } = playback;
  const lesson = lessons[lessonId];
  const frame = frames[step];

  function switchStage(next: Stage) {
    pause();
    if (next === 'card' && !progress.card) {
      onProgress(lessonId, (current) => ({ ...current, card: true }));
      onToast('Шпаргалка добавлена в твою коллекцию.');
    }
    setStage(next);
  }

  useEffect(() => {
    onViewed(lessonId, step);
  }, [lessonId, step, onViewed]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        stage !== 'watch'
        || collectionOpen
        || (event.target instanceof Element && event.target.matches('input,button'))
      ) { return; }
      if (event.key === 'ArrowRight' && step < frames.length - 1) {
        event.preventDefault();
        goTo(step + 1);
      }
      if (event.key === 'ArrowLeft' && step > 0) {
        event.preventDefault();
        goTo(step - 1);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stage, collectionOpen, step, frames.length, goTo]);

  return (
    <main id="mainContent" className={styles.content}>
      <div className={styles.lessonHeading}>
        <div>
          <div className={ui.eyebrow} id="lessonIndex">
            {`УРОК 0${lessonId === 2 ? 1 : 2} · ОПРЕДЕЛИТЕЛЬ ${lessonId} × ${lessonId}`}
          </div>
          <h2 id="lessonTitle">
            {lesson.title[0]}
            <br />
            {lesson.title[1]}
          </h2>
        </div>
      </div>
      <nav className={styles.stageTabs} aria-label="Этапы урока">
        <button
          type="button"
          data-stage="watch"
          className={stage === 'watch' ? styles.active : undefined}
          aria-current={stage === 'watch' ? 'step' : 'false'}
          onClick={() => switchStage('watch')}
        >
          <span>01</span>
          {' '}
          Смотрю
        </button>
        <button
          type="button"
          data-stage="card"
          className={stage === 'card' ? styles.active : undefined}
          aria-current={stage === 'card' ? 'step' : 'false'}
          onClick={() => switchStage('card')}
        >
          <span>02</span>
          {' '}
          Забираю шпаргалку
          {' '}
          <span className={styles.tabLock} id="cardLock">
            {progress.card ? '✓' : ''}
          </span>
        </button>
        <button
          type="button"
          data-stage="practice"
          className={stage === 'practice' ? styles.active : undefined}
          aria-current={stage === 'practice' ? 'step' : 'false'}
          onClick={() => switchStage('practice')}
        >
          <span>03</span>
          {' '}
          Решаю
        </button>
      </nav>
      <section
        id="watchPanel"
        aria-label="Объяснение способа"
        hidden={stage !== 'watch'}
      >
        <div className={styles.animationCard}>
          <div className={styles.canvasHead}>
            <div className={styles.canvasActions}>
              <button
                type="button"
                id="startAnimation"
                className={styles.animationStart}
                aria-pressed={playing}
                onClick={toggle}
              >
                {playbackLabel(playing, step, frames.length - 1)}
              </button>
              <span id="frameCounter">
                {`${String(step + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`}
              </span>
            </div>
          </div>
          <div className={styles.visualStage}>
            <div id="mainDiagram" className={styles.mainDiagram} ref={diagramRef}>
              <Diagram key={`${step}-${revision}`} matrix={lesson.example} paths={frame.paths} />
            </div>
            <div className={styles.stepExplanation}>
              <div className={styles.stepKicker} id="stepKicker">
                {frame.kicker}
              </div>
              <h3 id="stepTitle">{frame.title}</h3>
              <p id="stepText">{frame.text}</p>
              <div
                id="stepExpression"
                className={`${styles.stepExpression}${frame.negative ? ` ${styles.negative}` : ''}`}
              >
                {frame.expression}
                {frame.result !== undefined && (
                  <span className={styles.result}>{numberText(frame.result)}</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.animationFooter}>
            <button
              type="button"
              id="playButton"
              className={styles.playButton}
              aria-label={playing ? 'Поставить на паузу' : 'Запустить анимацию'}
              aria-pressed={playing}
              onClick={toggle}
            >
              {playing ? 'Ⅱ' : '▶'}
            </button>
            <div className={styles.timeline} id="timeline" aria-label="Шаги объяснения">
              {frames.map((timelineFrame, i) => (
                <button
                  type="button"
                  key={timelineFrame.kicker}
                  className={frameStatus(i, step, progress.viewed)}
                  data-frame={i}
                  aria-label={`Шаг ${i + 1}`}
                  aria-current={i === step ? 'step' : undefined}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className={styles.belowCanvas}>
          <button type="button" id="collectCard" className={`${ui.primaryButton} ${styles.collectButton}`} onClick={() => switchStage('card')}>
            {progress.card ? 'Открыть шпаргалку' : 'Забрать шпаргалку'}
            {' '}
            <span>↗</span>
          </button>
        </div>
      </section>
      <section
        id="cardPanel"
        aria-label="Шпаргалка"
        hidden={stage !== 'card'}
      >
        <div className={styles.cardIntro}>
          <div>
            <h3>Весь приём — в одной шпаргалке</h3>
          </div>
          <span className={styles.earnedBadge}>✓ В КОЛЛЕКЦИИ</span>
        </div>
        <CheatCard lessonId={lessonId} />
        <div className={styles.cardActions}>
          <button
            type="button"
            className={ui.primaryButton}
            id="startPractice"
            onClick={() => switchStage('practice')}
          >
            Перейти к задачам
            {' '}
            <span>↗</span>
          </button>
        </div>
      </section>
      <section
        id="practicePanel"
        aria-label="Самостоятельные задачи"
        hidden={stage !== 'practice'}
      >
        <Practice
          lessonId={lessonId}
          progress={progress}
          onProgress={(update) => onProgress(lessonId, update)}
          onReview={() => {
            goTo(0);
            switchStage('watch');
          }}
        />
      </section>
    </main>
  );
}
