import { useState, useEffect, useMemo, useRef } from 'react';

export interface CountdownTime {
  totalMs: number;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean; // < 1 minute (or custom threshold)
  isNearEnd: boolean; // < 1 hour
  isExpired: boolean;
}

export interface UseCountdownOptions {
  onEnd?: () => void;
  urgentThresholdSeconds?: number; // default: 60s
  nearEndThresholdSeconds?: number; // default: 3600s
}

function calculateTimeRemaining(
  target: Date | null,
  urgentThresholdMs: number,
  nearEndThresholdMs: number
): CountdownTime {
  if (!target || isNaN(target.getTime())) {
    return {
      totalMs: 0,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isUrgent: false,
      isNearEnd: false,
      isExpired: true,
    };
  }

  const totalMs = target.getTime() - Date.now();
  if (totalMs <= 0) {
    return {
      totalMs: 0,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isUrgent: false,
      isNearEnd: false,
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor((totalSeconds / 3600) % 24);
  const days = Math.floor(totalSeconds / 86400);

  return {
    totalMs,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isUrgent: totalMs <= urgentThresholdMs,
    isNearEnd: totalMs <= nearEndThresholdMs,
    isExpired: false,
  };
}

/**
 * Universal Countdown Hook with high precision, cleanup, and threshold triggers.
 * Suitable for live auctions, auto-bids, escrow inspection timers, and verification countdowns.
 */
export function useCountdown(
  targetDate: string | Date | number | null | undefined,
  options?: UseCountdownOptions
): CountdownTime {
  const { onEnd, urgentThresholdSeconds = 60, nearEndThresholdSeconds = 3600 } = options || {};

  const urgentThresholdMs = urgentThresholdSeconds * 1000;
  const nearEndThresholdMs = nearEndThresholdSeconds * 1000;

  const target = useMemo(() => {
    if (!targetDate) return null;
    return new Date(targetDate);
  }, [targetDate]);

  const [time, setTime] = useState<CountdownTime>(() =>
    calculateTimeRemaining(target, urgentThresholdMs, nearEndThresholdMs)
  );

  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    const immediate = calculateTimeRemaining(target, urgentThresholdMs, nearEndThresholdMs);
    setTime(immediate);

    if (immediate.isExpired) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(target, urgentThresholdMs, nearEndThresholdMs);
      setTime(remaining);

      if (remaining.isExpired) {
        clearInterval(interval);
        onEndRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target, urgentThresholdMs, nearEndThresholdMs]);

  return time;
}

export default useCountdown;
