import React, { createContext, useContext, ReactNode } from 'react';
import { useCountdownTimer } from '../hooks/useCountdownTimer';

interface TimerContextType {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
  formatTime: (seconds: number) => string;
  getProgress: () => number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const timer = useCountdownTimer();

  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
