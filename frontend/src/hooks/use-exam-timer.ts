import { useState, useEffect, useRef } from "react";

interface TimerResult {
  remainingSeconds: number;
  minutes: number;
  seconds: number;
  isLowTime: boolean;
  isUrgent: boolean;
  formattedTime: string;
}

/**
 * Countdown timer hook with auto-submit callback.
 * @param startedAt - ISO timestamp when exam started.
 * @param durationMinutes - Exam duration in minutes.
 * @param onTimeUp - Callback when timer reaches zero.
 */
export function useExamTimer(
  startedAt: string | null,
  durationMinutes: number,
  onTimeUp: () => void,
): TimerResult {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    durationMinutes * 60,
  );
  const onTimeUpRef = useRef(onTimeUp);
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (!startedAt) return;

    const endTime = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setRemainingSeconds(remaining);

      if (remaining === 0 && !hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true;
        onTimeUpRef.current();
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationMinutes]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isLowTime = remainingSeconds < 300 && remainingSeconds > 0;
  const isUrgent = remainingSeconds < 60 && remainingSeconds > 0;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return {
    remainingSeconds,
    minutes,
    seconds,
    isLowTime,
    isUrgent,
    formattedTime,
  };
}
