import { useLayoutEffect, useRef, useState } from 'react';
import CheatCard from './CheatCard';
import Diagram from './Diagram';
import { determinant, numberText } from './lessons';
import type { LessonId } from './lessons';
import type { LessonProgress, ProgressUpdate } from './progress';
import generateTask from './tasks';
import styles from './Practice.module.css';

interface Props {
  lessonId: LessonId;
  progress: LessonProgress;
  onProgress: (update: ProgressUpdate) => void;
  onReview: () => void;
}

export default function Practice({
  lessonId,
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
    const matrix = generateTask(lessonId, progress.solved);
    onProgress((current) => (current.task === progress.task && current.task.solved
      ? { ...current, task: { matrix, solved: false } }
      : current));
    resetAnswer();
  }

  return (
    <>
      <div className="practice-top">
        <span className="eyebrow">
          {`Решено задач: ${progress.solved}`}
        </span>
      </div>
      <div className="practice-card">
        <div className="task-header">
          <h3>Найди определитель</h3>
          <button
            type="button"
            className="secondary-button"
            id="hintButton"
            aria-expanded={hintOpen}
            onClick={() => {
              setHintOpen(!hintOpen);
            }}
          >
            ▱
            {' '}
            {hintOpen ? 'Скрыть шпаргалку' : 'Показать шпаргалку'}
          </button>
        </div>
        <div className="task-body">
          <div className="task-matrix">
            <Diagram matrix={progress.task.matrix} />
          </div>
          <div className="answer-area">
            <form
              id="answerForm"
              onSubmit={(event) => {
                event.preventDefault();
                if (answered) nextTask();
                else checkAnswer();
              }}
            >
              <label htmlFor="answerInput">Твой ответ</label>
              <div className="answer-row">
                <span className="det-label">det A =</span>
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
                className={`primary-button ${styles.actionButton}`}
                type="submit"
                id={answered ? 'nextTask' : undefined}
              >
                {answered ? 'Следующая задача' : 'Проверить'}
                {answered && <span aria-hidden="true">→</span>}
              </button>
              <div className={styles.answerFeedback}>
                <div
                  id="taskFeedback"
                  className={`feedback${!answered && feedback ? ' wrong' : ''}`}
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
      <div id="practiceHint" className="practice-hint" hidden={!hintOpen}>
        <CheatCard lessonId={lessonId} />
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button type="button" className="secondary-button" id="reviewExplanation" onClick={onReview}>
            Посмотреть разбор ещё раз ↗
          </button>
        </div>
      </div>
    </>
  );
}
