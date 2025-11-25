import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface LoopingTimerProps {
  isVisible: boolean;
  onClose: () => void;
}

type TimerMode = 'workout' | 'rest' | 'stopped';

export const LoopingTimer: React.FC<LoopingTimerProps> = ({ isVisible, onClose }) => {
  const { colors } = useTheme();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mode, setMode] = useState<TimerMode>('stopped');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (mode === 'stopped') {
      setMode('workout');
      setElapsedSeconds(0);
    }
  };

  const switchMode = () => {
    if (mode === 'workout') {
      setMode('rest');
      setElapsedSeconds(0);
    } else if (mode === 'rest') {
      setMode('workout');
      setElapsedSeconds(0);
    }
  };

  const stopTimer = () => {
    setMode('stopped');
    setElapsedSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (mode !== 'stopped') {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
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
  }, [mode]);

  const getModeColor = () => {
    if (mode === 'workout') return '#22C55E';
    if (mode === 'rest') return '#3B82F6';
    return '#6B7280';
  };

  const getModeText = () => {
    if (mode === 'workout') return 'WORKOUT';
    if (mode === 'rest') return 'REST';
    return 'READY';
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Workout Timer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.modeIndicator, { backgroundColor: getModeColor() }]}>
            <Text style={styles.modeText}>{getModeText()}</Text>
          </View>

          <View style={styles.timerDisplay}>
            <Text style={[styles.timerText, { color: colors.textPrimary }]}>
              {formatTime(elapsedSeconds)}
            </Text>
          </View>

          <View style={styles.controls}>
            {mode === 'stopped' ? (
              <TouchableOpacity style={styles.startButton} onPress={startTimer}>
                <Play size={32} color="#fff" fill="#fff" />
                <Text style={styles.startButtonText}>Start Workout</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: getModeColor() }]}
                  onPress={switchMode}
                >
                  <RotateCcw size={24} color="#fff" />
                  <Text style={styles.controlButtonText}>
                    {mode === 'workout' ? 'Start Rest' : 'Start Workout'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, styles.stopButton]}
                  onPress={stopTimer}
                >
                  <Pause size={24} color="#fff" />
                  <Text style={styles.controlButtonText}>Stop</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            {mode === 'stopped'
              ? 'Press Start to begin your workout timer'
              : `Press "${mode === 'workout' ? 'Start Rest' : 'Start Workout'}" to switch modes`}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  modeIndicator: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    gap: 12,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
