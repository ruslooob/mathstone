import { useEffect, useState } from 'react';
import ui from './ui.module.css';
import styles from './ParagraphView.module.css';
import Diagram from './Diagram';
import Practice from './Practice';
import { paragraphs, numberText } from './paragraphs';
import type { ParagraphId } from './paragraphs';
import type { ParagraphProgress, ProgressUpdate } from './progress';
import usePlayback from './usePlayback';

type Stage = 'watch' | 'practice';

function frameStatus(index: number, step: number, viewed: readonly number[]) {
  if (index === step) return styles.current;
  return viewed.includes(index) ? styles.passed : undefined;
}

interface ParagraphViewProps {
  paragraphId: ParagraphId;
  progress: ParagraphProgress;
  inventoryOpen: boolean;
  onProgress: (paragraphId: ParagraphId, update: ProgressUpdate) => void;
  onViewed: (paragraphId: ParagraphId, step: number) => void;
}

export default function ParagraphView({
  paragraphId,
  progress,
  inventoryOpen,
  onProgress,
  onViewed,
}: ParagraphViewProps) {
  const [stage, setStage] = useState<Stage>('watch');
  const playback = usePlayback(paragraphId);
  const {
    frames, step, playing, revision, diagramRef, goTo, toggle, pause,
  } = playback;
  const paragraph = paragraphs[paragraphId];
  const frame = frames[step];

  function switchStage(next: Stage) {
    pause();
    setStage(next);
  }

  useEffect(() => {
    onViewed(paragraphId, step);
  }, [paragraphId, step, onViewed]);
  useEffect(() => {
    if (inventoryOpen) pause();
  }, [inventoryOpen, pause]);
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
          Объяснение
        </button>
        <button
          type="button"
          data-stage="practice"
          className={stage === 'practice' ? styles.active : undefined}
          aria-current={stage === 'practice' ? 'step' : 'false'}
          onClick={() => switchStage('practice')}
        >
          Практика
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
          </div>
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
        />
      </section>
    </main>
  );
}
