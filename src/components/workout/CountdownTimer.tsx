import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Play, Pause, RotateCcw, X } from 'lucide-react-native';
import { useTimer } from '../../context/TimerContext';
import { useTheme } from '../../context/ThemeContext';
import { useTimerPresets } from '../../hooks/useTimerPresets';
import { PresetEditorModal } from './PresetEditorModal';
import { RollingDigit } from '../common/RollingDigit';
import { TimePicker } from './TimePicker';

interface CountdownTimerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ isVisible, onClose }) => {
  const { colors } = useTheme();
  const {
    remainingSeconds,
    totalSeconds,
    isRunning,
    start,
    pause,
    reset,
    setTime,
    formatTime,
    getProgress,
  } = useTimer();

  const { presets, editingPreset, editingIndex, startEditing, cancelEditing, saveEditedPreset } = useTimerPresets();

  // Local state for the picker's displayed value.
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(1);
  const [selectedSeconds, setSelectedSeconds] = useState(0);

  // Track if we're in the middle of closing to prevent updates during animation
  const [isClosing, setIsClosing] = useState(false);

  // When the timer context's totalSeconds changes (e.g., from a preset),
  // update the local state for the picker.
  useEffect(() => {
    if (isVisible) {
      setIsClosing(false);
      const newHours = Math.floor(totalSeconds / 3600);
      const newMinutes = Math.floor((totalSeconds % 3600) / 60);
      const newSeconds = totalSeconds % 60;

      setSelectedHours(newHours);
      setSelectedMinutes(newMinutes);
      setSelectedSeconds(newSeconds);
    }
  }, [totalSeconds, isVisible]);

  const handleStart = () => {
    start();
  };

  const handlePause = () => {
    pause();
  };

  const handleReset = () => {
    reset();
  };

  // When a preset is clicked, update the timer context.
  // The useEffect above will handle updating the picker's visual state.
  const handlePresetTimer = (seconds: number) => {
    setTime(seconds);
  };

  // When the user stops scrolling the picker, update the timer context.
  const handleScrollEnd = (time: { hours: number; minutes: number; seconds: number }) => {
    const totalSecs = time.hours * 3600 + time.minutes * 60 + time.seconds;
    setTime(totalSecs);
  };

  const handleClose = () => {
    setIsClosing(true);
    onClose();
  };

  const progress = getProgress();
  const timeString = formatTime(remainingSeconds);
  const timeChars = timeString.split('');

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={[styles.backdrop, { backgroundColor: `rgba(0, 0, 0, ${colors.background === '#FCFCFC' ? '0.4' : '0.7'})` }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} testID="modal-backdrop" />
        <View style={[styles.container, { backgroundColor: colors.surface, opacity: isClosing ? 0 : 1 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.timerDisplay}>
            <View style={styles.circleContainer}>
              <View style={[styles.circleBackground, { borderColor: colors.border }]} />
              <View
                style={[
                  styles.circleProgress,
                  {
                    borderColor: remainingSeconds === 0 ? '#34C759' : colors.textPrimary,
                    borderWidth: 8,
                  },
                ]}
              />
              <View style={styles.timeDisplayRow}>
                {timeChars.map((char, index) => (
                  <RollingDigit key={`${index}-${char}`} value={char} colors={colors} />
                ))}
              </View>
            </View>
          </View>

          {!isRunning && (
            <>
              <View style={styles.presetsContainer}>
                {presets.map((preset, index) => (
                  <TouchableOpacity
                    key={`${preset.label}-${index}`}
                    style={[styles.presetButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                    onPress={() => handlePresetTimer(preset.seconds)}
                    onLongPress={() => startEditing(index)}
                    delayLongPress={500}
                  >
                    <Text style={[styles.presetButtonText, { color: colors.textPrimary }]}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TimePicker
                selectedHours={selectedHours}
                selectedMinutes={selectedMinutes}
                selectedSeconds={selectedSeconds}
                onHoursChange={setSelectedHours}
                onMinutesChange={setSelectedMinutes}
                onSecondsChange={setSelectedSeconds}
                onScrollEnd={handleScrollEnd}
                isRunning={isRunning}
              />
            </>
          )}

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
              <RotateCcw size={28} color={colors.textPrimary} />
            </TouchableOpacity>

            {!isRunning ? (
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton, { backgroundColor: colors.accent }]}
                onPress={handleStart}
                disabled={remainingSeconds === 0}
              >
                <Play size={36} color={colors.surface} fill={colors.surface} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton, { backgroundColor: colors.accent }]}
                onPress={isRunning ? handlePause : handleStart}
                disabled={remainingSeconds === 0}
              >
                {isRunning ? (
                  <Pause size={36} color={colors.surface} fill={colors.surface} />
                ) : (
                  <Play size={36} color={colors.surface} fill={colors.surface} />
                )}
              </TouchableOpacity>
            )}
            <View style={styles.controlButton} />
          </View>
        </View>
      </View>

      <PresetEditorModal
        isVisible={editingIndex !== null}
        onClose={cancelEditing}
        onSave={saveEditedPreset}
        preset={editingPreset}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 24,
    minHeight: 500,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  circleContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    borderColor: '#f0f0f0',
  },
  circleProgress: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: -20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
