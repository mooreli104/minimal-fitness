import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getItem, setItem, removeItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

type TimerMode = 'workout' | 'rest' | 'stopped';

interface TimerState {
  mode: TimerMode;
  startTimestamp: number;
}

export const InlineLoopingTimer: React.FC = () => {
  const { colors } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mode, setMode] = useState<TimerMode>('stopped');
  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveTimerState = async (newMode: TimerMode, newStartTimestamp: number) => {
    if (newMode === 'stopped') {
      await removeItem(STORAGE_KEYS.LOOPING_TIMER_STATE);
    } else {
      const state: TimerState = {
        mode: newMode,
        startTimestamp: newStartTimestamp,
      };
      await setItem(STORAGE_KEYS.LOOPING_TIMER_STATE, state);
    }
  };

  const startTimer = () => {
    const now = Date.now();
    setMode('workout');
    setStartTimestamp(now);
    setElapsedSeconds(0);
    saveTimerState('workout', now);
  };

  const switchMode = () => {
    const now = Date.now();
    if (mode === 'workout') {
      setMode('rest');
      setStartTimestamp(now);
      setElapsedSeconds(0);
      saveTimerState('rest', now);
    } else if (mode === 'rest') {
      setMode('workout');
      setStartTimestamp(now);
      setElapsedSeconds(0);
      saveTimerState('workout', now);
    }
  };

  const stopTimer = async () => {
    setMode('stopped');
    setElapsedSeconds(0);
    setStartTimestamp(0);
    await saveTimerState('stopped', 0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Load timer state on mount
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const savedState = await getItem<TimerState>(STORAGE_KEYS.LOOPING_TIMER_STATE);
        if (savedState && savedState.mode !== 'stopped') {
          const now = Date.now();
          const elapsed = Math.floor((now - savedState.startTimestamp) / 1000);
          setMode(savedState.mode);
          setStartTimestamp(savedState.startTimestamp);
          setElapsedSeconds(elapsed);
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    };
    loadTimerState();
  }, []);

  useEffect(() => {
    if (mode !== 'stopped' && startTimestamp > 0) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimestamp) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, startTimestamp]);

  const getModeColor = () => {
    if (mode === 'workout') return '#22C55E';
    if (mode === 'rest') return '#3B82F6';
    return '#6B7280';
  };

  if (mode === 'stopped') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: colors.surface }]}
        onPress={startTimer}
      >
        <Play size={20} color="#22C55E" fill="#22C55E" />
        <Text style={[styles.startText, { color: colors.textPrimary }]}>Start Workout Timer</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.activeContainer, { backgroundColor: colors.surface }]}>
      <View style={[styles.modeIndicator, { backgroundColor: getModeColor() }]}>
        <Text style={styles.modeText}>{mode.toUpperCase()}</Text>
      </View>

      <Text style={[styles.timerText, { color: colors.textPrimary }]}>
        {formatTime(elapsedSeconds)}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: getModeColor() }]}
          onPress={switchMode}
        >
          <RotateCcw size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          onPress={stopTimer}
        >
          <Pause size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
});
