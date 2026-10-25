import { useLayoutEffect, useRef, useState } from 'react';
import ui from './ui.module.css';
import Diagram from './Diagram';
import { determinant } from './paragraphs';
import type { ParagraphId } from './paragraphs';
import type { ParagraphProgress, ProgressUpdate } from './progress';
import generateTask from './tasks';
import styles from './Practice.module.css';

interface Props {
  paragraphId: ParagraphId;
  progress: ParagraphProgress;
  onProgress: (update: ProgressUpdate) => void;
}

export default function Practice({
  paragraphId,
  progress,
  onProgress,
}: Props) {
  const answer = determinant(progress.task.matrix);
  const [input, setInput] = useState(() => (
    progress.task.submittedAnswer ?? (progress.task.solved ? String(answer) : '')
  ));
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const answered = progress.task.solved;

  useLayoutEffect(() => {
    if (answered) actionRef.current?.focus({ preventScroll: true });
    else inputRef.current?.focus({ preventScroll: true });
  }, [answered]);

  function resetAnswer() {
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
      ? {
        ...current,
        solved: current.solved + 1,
        task: { ...current.task, solved: true, submittedAnswer: input },
      }
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
                  value={input}
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
                  <p id="feedbackText">{answered ? 'Верно!' : feedback}</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
