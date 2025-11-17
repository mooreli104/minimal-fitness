import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Play, Pause, RotateCcw, X } from 'lucide-react-native';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';

interface CountdownTimerProps {
  isVisible: boolean;
  onClose: () => void;
}

const PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
];

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ isVisible, onClose }) => {
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
  } = useCountdownTimer();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');
  const [editSeconds, setEditSeconds] = useState('');

  const handleEdit = () => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    setEditMinutes(mins.toString());
    setEditSeconds(secs.toString());
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    const mins = parseInt(editMinutes || '0', 10);
    const secs = parseInt(editSeconds || '0', 10);

    if (isNaN(mins) || isNaN(secs) || mins < 0 || secs < 0 || secs >= 60) {
      Alert.alert('Invalid Time', 'Please enter valid minutes (0+) and seconds (0-59).');
      return;
    }

    const totalSecs = mins * 60 + secs;

    if (totalSecs === 0) {
      Alert.alert('Invalid Time', 'Timer must be at least 1 second.');
      return;
    }

    setTime(totalSecs);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditMinutes('');
    setEditSeconds('');
  };

  const handlePreset = (seconds: number) => {
    setTime(seconds);
  };

  const progress = getProgress();
  const circumference = 2 * Math.PI * 120; // radius = 120

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#000" />
          </TouchableOpacity>

          {/* Timer Circle Display */}
          <View style={styles.timerDisplay}>
            {/* Progress circle background */}
            <View style={styles.circleContainer}>
              <View style={styles.circleBackground} />
              <View
                style={[
                  styles.circleProgress,
                  {
                    borderColor: remainingSeconds === 0 ? '#34C759' : '#000',
                    borderWidth: 8,
                  },
                ]}
              />

              {/* Time display */}
              {isEditMode ? (
                <View style={styles.editContainer}>
                  <View style={styles.editInputRow}>
                    <TextInput
                      style={styles.editInput}
                      value={editMinutes}
                      onChangeText={setEditMinutes}
                      keyboardType="number-pad"
                      maxLength={3}
                      placeholder="0"
                      placeholderTextColor="#ccc"
                    />
                    <Text style={styles.editColon}>:</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editSeconds}
                      onChangeText={setEditSeconds}
                      keyboardType="number-pad"
                      maxLength={2}
                      placeholder="00"
                      placeholderTextColor="#ccc"
                    />
                  </View>
                  <View style={styles.editButtonRow}>
                    <TouchableOpacity style={styles.editButton} onPress={handleCancelEdit}>
                      <Text style={styles.editButtonTextCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={handleSaveEdit}>
                      <Text style={styles.editButtonTextSave}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={handleEdit} disabled={isRunning}>
                  <Text key={remainingSeconds} style={styles.timeText}>{formatTime(remainingSeconds)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Preset buttons */}
          {!isEditMode && !isRunning && remainingSeconds === totalSeconds && (
            <View style={styles.presetsContainer}>
              {PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  style={styles.presetButton}
                  onPress={() => handlePreset(preset.seconds)}
                >
                  <Text style={styles.presetButtonText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Control buttons */}
          {!isEditMode && (
            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={reset}>
                <RotateCcw size={28} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={isRunning ? pause : start}
                disabled={remainingSeconds === 0}
              >
                {isRunning ? (
                  <Pause size={36} color="#fff" fill="#fff" />
                ) : (
                  <Play size={36} color="#fff" fill="#fff" />
                )}
              </TouchableOpacity>

              <View style={styles.controlButton} />
            </View>
          )}
        </View>
      </TouchableOpacity>
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
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: '#f0f0f0',
  },
  circleProgress: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  timeText: {
    fontSize: 64,
    fontWeight: '300',
    color: '#000',
    letterSpacing: -2,
  },
  editContainer: {
    alignItems: 'center',
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  editInput: {
    fontSize: 48,
    fontWeight: '300',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    textAlign: 'center',
    minWidth: 80,
    paddingHorizontal: 8,
    color: '#000',
  },
  editColon: {
    fontSize: 48,
    fontWeight: '300',
    marginHorizontal: 8,
    color: '#000',
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  editButtonTextCancel: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  editButtonTextSave: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  presetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
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
    backgroundColor: '#000',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
