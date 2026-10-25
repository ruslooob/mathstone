import { useEffect, useState } from 'react';
import ui from './ui.module.css';
import styles from './ParagraphView.module.css';
import CheatSheet from './CheatSheet';
import Diagram from './Diagram';
import Practice from './Practice';
import { paragraphs, numberText } from './paragraphs';
import type { ParagraphId } from './paragraphs';
import type { ParagraphProgress, ProgressUpdate } from './progress';
import { hasCheatSheet, solutionsForCheatSheet } from './progress';
import usePlayback from './usePlayback';

type Stage = 'watch' | 'cheatSheet' | 'practice';

function frameStatus(index: number, step: number, viewed: readonly number[]) {
  if (index === step) return styles.current;
  return viewed.includes(index) ? styles.passed : undefined;
}

interface ParagraphViewProps {
  paragraphId: ParagraphId;
  initialCheatSheet: boolean;
  progress: ParagraphProgress;
  inventoryOpen: boolean;
  onProgress: (paragraphId: ParagraphId, update: ProgressUpdate) => void;
  onViewed: (paragraphId: ParagraphId, step: number) => void;
}

export default function ParagraphView({
  paragraphId,
  initialCheatSheet,
  progress,
  inventoryOpen,
  onProgress,
  onViewed,
}: ParagraphViewProps) {
  const [stage, setStage] = useState<Stage>(initialCheatSheet ? 'cheatSheet' : 'watch');
  const playback = usePlayback(paragraphId);
  const {
    frames, step, playing, revision, diagramRef, goTo, toggle, pause,
  } = playback;
  const paragraph = paragraphs[paragraphId];
  const frame = frames[step];
  const cheatSheetUnlocked = hasCheatSheet(progress);

  function switchStage(next: Stage) {
    pause();
    if (next === 'cheatSheet' && !cheatSheetUnlocked) return;
    setStage(next);
  }

  useEffect(() => {
    onViewed(paragraphId, step);
  }, [paragraphId, step, onViewed]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        stage !== 'watch'
        || inventoryOpen
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
  }, [stage, inventoryOpen, step, frames.length, goTo]);

  return (
    <main id="mainContent" className={styles.content}>
      <div className={styles.paragraphHeading}>
        <div>
          <div className={ui.eyebrow} id="paragraphIndex">
            {`ПАРАГРАФ 0${paragraphId === 2 ? 1 : 2} · ОПРЕДЕЛИТЕЛЬ ${paragraphId} × ${paragraphId}`}
          </div>
          <h2 id="paragraphTitle">
            {paragraph.title}
          </h2>
        </div>
      </div>
      <nav className={styles.stageTabs} aria-label="Этапы параграфа">
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
          data-stage="cheatSheet"
          disabled={!cheatSheetUnlocked}
          title={cheatSheetUnlocked
            ? undefined
            : `Откроется после ${solutionsForCheatSheet} верных решений этого параграфа.`}
          className={stage === 'cheatSheet' ? styles.active : undefined}
          aria-current={stage === 'cheatSheet' ? 'step' : 'false'}
          onClick={() => switchStage('cheatSheet')}
        >
          <span>02</span>
          {' '}
          Шпаргалка
          {' '}
          <span className={styles.tabLock} id="cheatSheetLock">
            {cheatSheetUnlocked ? '✓' : ''}
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
        <div className={styles.explanationPanel}>
          <div className={styles.visualStage}>
            <div id="mainDiagram" className={styles.mainDiagram} ref={diagramRef}>
              <Diagram key={`${step}-${revision}`} matrix={paragraph.example} paths={frame.paths} />
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
            <span className={styles.frameCounter} id="frameCounter">
              {`${String(step + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`}
            </span>
          </div>
        </div>
      </section>
      <section
        id="cheatSheetPanel"
        aria-label="Шпаргалка"
        hidden={stage !== 'cheatSheet' || !cheatSheetUnlocked}
      >
        <div className={styles.cheatSheetIntro}>
          <div>
            <h3>Весь приём — в одной шпаргалке</h3>
          </div>
          <span className={styles.earnedBadge}>✓ В ИНВЕНТАРЕ</span>
        </div>
        {cheatSheetUnlocked && <CheatSheet paragraphId={paragraphId} />}
        <div className={styles.cheatSheetActions}>
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
          paragraphId={paragraphId}
          progress={progress}
          onProgress={(update) => onProgress(paragraphId, update)}
          onReview={() => {
            goTo(0);
            switchStage('watch');
          }}
        />
      </section>
    </main>
  );
}
