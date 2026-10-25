import { useLayoutEffect, useRef, useState } from 'react';
import CheatCard from './CheatCard';
import Diagram from './Diagram';
import { determinant, lessons, numberText } from './lessons';
import type { LessonId } from './lessons';
import type { LessonProgress } from './progress';

interface Props {
  lessonId: LessonId;
  progress: LessonProgress;
  otherDone: boolean;
  onProgress: (update: Partial<LessonProgress>) => void;
  onReview: () => void;
  onCard: () => void;
  onOtherLesson: () => void;
}

function taskStatus(index: number, solved: number) {
  if (index < solved) return 'done';
  return index === solved ? 'current' : '';
}

export default function Practice({
  lessonId,
  progress,
  otherDone,
  onProgress,
  onReview,
  onCard,
  onOtherLesson,
}: Props) {
  const [hintOpen, setHintOpen] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackKind, setFeedbackKind] = useState<'wrong' | 'correct' | ''>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const lesson = lessons[lessonId];
  const other = lessonId === 2 ? 3 : 2;

  useLayoutEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  function resetAnswer() {
    setAnswered(false);
    setHintOpen(false);
    setInput('');
    setFeedback('');
    setFeedbackKind('');
  }

  function checkAnswer() {
    if (answered) return;
    const value = input.trim().replace(/−/g, '-').replace(',', '.');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) || !Number.isFinite(Number(value))) {
      setFeedbackKind('wrong');
      setFeedback('Введи ответ числом. Например: 5, −2 или 0.');
      inputRef.current?.focus();
      return;
    }
    const answer = determinant(lesson.tasks[progress.solved]);
    if (Number(value) !== answer) {
      setFeedbackKind('wrong');
      setFeedback('Пока не сходится');
      return;
    }
    setAnswered(true);
    setInput(numberText(answer));
    setFeedbackKind('correct');
    setFeedback('Верно');
  }

  function nextTask() {
    if (!answered) return;
    const solved = progress.solved + 1;
    onProgress({ solved, ...(solved === 3 ? { completed: true, card: true } : {}) });
    resetAnswer();
  }

  if (progress.completed) {
    return (
      <div className="complete-card">
        <div className="complete-mark">✓</div>
        <div className="eyebrow">ШПАРГАЛКА ОСВОЕНА</div>
        <h3>
          {`${lessonId} × ${lessonId} — получилось!`}
        </h3>
        <p>
          Ты прошёл разбор и решил три задачи. Шпаргалка остаётся в коллекции: к ней можно вернуться
          в любой момент.
        </p>
        <div className="complete-stats">
          <div>
            <strong>3 / 3</strong>
            <span>задачи решены</span>
          </div>
          <div>
            <strong>{3 - progress.hints.length}</strong>
            <span>без открытия схемы</span>
          </div>
        </div>
        <div className="complete-actions">
          <button type="button" className="primary-button" id="goOtherLesson" onClick={onOtherLesson}>
            {otherDone ? 'Повторить другой урок' : `Перейти к матрицам ${other} × ${other}`}
            {' '}
            <span>↗</span>
          </button>
          <button
            type="button"
            className="secondary-button"
            id="repeatPractice"
            onClick={() => {
              onProgress({ solved: 0, hints: [], completed: false });
              resetAnswer();
            }}
          >
            Пройти задачи ещё раз
          </button>
          <button type="button" className="secondary-button" id="viewEarnedCard" onClick={onCard}>
            Открыть шпаргалку
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="practice-top">
        <span className="eyebrow">
          {`ТВОЯ ОЧЕРЕДЬ · ЗАДАЧА ${progress.solved + 1} ИЗ 3`}
        </span>
        <div className="task-dots">
          {lesson.tasks.map((task, i) => (
            <span
              key={JSON.stringify(task)}
              className={`task-dot ${taskStatus(i, progress.solved)}`}
            />
          ))}
        </div>
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
              if (!hintOpen && !progress.hints.includes(progress.solved)) {
                onProgress({ hints: [...progress.hints, progress.solved] });
              }
            }}
          >
            ▱
            {' '}
            {hintOpen ? 'Скрыть шпаргалку' : 'Показать шпаргалку'}
          </button>
        </div>
        <div className="task-body">
          <div className="task-matrix">
            <Diagram matrix={lesson.tasks[progress.solved]} />
          </div>
          <div className="answer-area">
            <form
              id="answerForm"
              onSubmit={(event) => {
                event.preventDefault();
                checkAnswer();
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
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  aria-invalid={feedbackKind === 'wrong' || undefined}
                />
              </div>
              <button className="primary-button" type="submit" disabled={answered}>
                Проверить
                {' '}
                <span>→</span>
              </button>
            </form>
          </div>
        </div>
        <div
          id="taskFeedback"
          className={`feedback${feedbackKind === 'wrong' ? ' wrong' : ''}`}
          role="status"
          hidden={!feedback}
        >
          <p id="feedbackText">{feedback}</p>
          {answered && (
            <button type="button" ref={nextRef} className="primary-button" id="nextTask" onClick={nextTask}>
              {progress.solved === 2 ? 'Завершить урок' : 'Следующая задача'}
              {' '}
              <span>→</span>
            </button>
          )}
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
