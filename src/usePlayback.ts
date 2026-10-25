import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { framesFor } from './lessons';
import type { LessonId } from './lessons';

const FRAME_DURATION = 5000;

export default function usePlayback(lessonId: LessonId) {
  const frames = useMemo(() => framesFor(lessonId), [lessonId]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [revision, setRevision] = useState(0);
  const diagramRef = useRef<HTMLDivElement>(null);
  const remaining = useRef(FRAME_DURATION);
  const startedAt = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    if (startedAt.current !== null) {
      remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt.current));
      startedAt.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setPlaying(false);
    diagramRef.current?.getAnimations({ subtree: true }).forEach((animation) => animation.pause());
  }, [clearTimer]);

  function goTo(next: number) {
    pause();
    remaining.current = FRAME_DURATION;
    setStep(Math.max(0, Math.min(frames.length - 1, next)));
    setRevision((current) => current + 1);
  }

  function toggle() {
    if (playing) {
      pause();
      return;
    }
    if (step === 0 || step === frames.length - 1) {
      remaining.current = FRAME_DURATION;
      setStep(1);
    }
    setPlaying(true);
  }

  useEffect(() => {
    if (!playing) return undefined;
    startedAt.current = performance.now();
    timer.current = setTimeout(() => {
      timer.current = null;
      startedAt.current = null;
      remaining.current = FRAME_DURATION;
      setStep(step + 1);
      if (step + 1 === frames.length - 1) setPlaying(false);
    }, remaining.current);
    return clearTimer;
  }, [playing, step, frames.length, clearTimer]);

  useLayoutEffect(() => {
    if (playing) {
      diagramRef.current
        ?.getAnimations({ subtree: true })
        .filter((animation) => animation.playState === 'paused')
        .forEach((animation) => animation.play());
    }
  }, [playing, step, revision]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pause]);

  return {
    frames,
    step,
    playing,
    revision,
    diagramRef,
    pause,
    goTo,
    toggle,
  };
}
