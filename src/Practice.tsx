import { useLayoutEffect, useRef, useState } from 'react';
import ui from './ui.module.css';
import CheatSheet from './CheatSheet';
import Diagram from './Diagram';
import { determinant, numberText } from './paragraphs';
import type { ParagraphId } from './paragraphs';
import type { ParagraphProgress, ProgressUpdate } from './progress';
import { hasCheatSheet, solutionsForCheatSheet } from './progress';
import generateTask from './tasks';
import styles from './Practice.module.css';

interface Props {
  paragraphId: ParagraphId;
  progress: ParagraphProgress;
  onProgress: (update: ProgressUpdate) => void;
  onReview: () => void;
}

export default function Practice({
  paragraphId,
  progress,
  onProgress,
  onReview,
}: Props) {
  const [hintOpen, setHintOpen] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const answered = progress.task.solved;
  const answer = determinant(progress.task.matrix);
  const cheatSheetUnlocked = hasCheatSheet(progress);

  useLayoutEffect(() => {
    if (answered) actionRef.current?.focus({ preventScroll: true });
    else inputRef.current?.focus({ preventScroll: true });
  }, [answered]);

  function resetAnswer() {
    setHintOpen(false);
    setInput('');
    setFeedback('');
  }

  function checkAnswer() {
    if (answered) return;
    const value = input.trim().replace(/−/g, '-').replace(',', '.');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) || !Number.isFinite(Number(value))) {
      setFeedback('Введи ответ числом. Например: 5, −2 или 0.');
      inputRef.current?.focus();
      return;
    }
    if (Number(value) !== answer) {
      setFeedback('Пока не сходится');
      return;
    }
    onProgress((current) => (current.task === progress.task && !current.task.solved
      ? { ...current, solved: current.solved + 1, task: { ...current.task, solved: true } }
      : current));
  }

  function nextTask() {
    if (!answered) return;
    const matrix = generateTask(paragraphId, progress.solved);
    onProgress((current) => (current.task === progress.task && current.task.solved
      ? { ...current, task: { matrix, solved: false } }
      : current));
    resetAnswer();
  }

  return (
    <>
      <div className={styles.practiceTop}>
        <span className={`${ui.eyebrow} ${styles.practiceCount}`}>
          {`Решено задач: ${progress.solved}`}
        </span>
      </div>
      <div className={styles.practiceCard}>
        <div className={styles.taskHeader}>
          <h3>Найди определитель</h3>
          <button
            type="button"
            className={`${ui.secondaryButton} ${styles.hintButton}`}
            id="hintButton"
            disabled={!cheatSheetUnlocked}
            title={cheatSheetUnlocked
              ? undefined
              : `Откроется после ${solutionsForCheatSheet} верных решений этого параграфа.`}
            aria-expanded={hintOpen}
            onClick={() => {
              setHintOpen(!hintOpen);
            }}
          >
            {hintOpen ? 'Скрыть шпаргалку' : 'Показать шпаргалку'}
          </button>
        </div>
        <div className={styles.taskBody}>
          <div className={styles.taskMatrix}>
            <Diagram matrix={progress.task.matrix} />
          </div>
          <div className={styles.answerArea}>
            <form
              id="answerForm"
              onSubmit={(event) => {
                event.preventDefault();
                if (answered) nextTask();
                else checkAnswer();
              }}
            >
              <label htmlFor="answerInput">Твой ответ</label>
              <div className={styles.answerRow}>
                <span className={styles.detLabel}>det A =</span>
                <input
                  ref={inputRef}
                  id="answerInput"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  aria-describedby="feedbackText"
                  placeholder="?"
                  disabled={answered}
                  value={answered ? numberText(answer) : input}
                  onChange={(event) => setInput(event.target.value)}
                  aria-invalid={(!answered && Boolean(feedback)) || undefined}
                />
              </div>
              <button
                ref={actionRef}
                className={`${ui.primaryButton} ${styles.actionButton}`}
                type="submit"
                id={answered ? 'nextTask' : undefined}
              >
                {answered ? 'Следующая задача' : 'Проверить'}
                {answered && <span aria-hidden="true">→</span>}
              </button>
              <div className={styles.answerFeedback}>
                <div
                  id="taskFeedback"
                  className={`${styles.feedback}${!answered && feedback ? ` ${styles.wrong}` : ''}`}
                  role="status"
                  hidden={!answered && !feedback}
                >
                  <p id="feedbackText">{answered ? 'Верно' : feedback}</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div id="practiceHint" className={styles.practiceHint} hidden={!hintOpen}>
        {cheatSheetUnlocked && <CheatSheet paragraphId={paragraphId} compact />}
        <div className={styles.reviewActions}>
          <button type="button" className={ui.secondaryButton} id="reviewExplanation" onClick={onReview}>
            Посмотреть разбор ещё раз ↗
          </button>
        </div>
      </div>
    </>
  );
}
