import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { Play, Pause, RotateCcw, X, Edit3 } from 'lucide-react-native';
import { useTimer } from '../../context/TimerContext';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CountdownTimerProps {
  isVisible: boolean;
  onClose: () => void;
}
interface PresetTimer {
  label: string;
  seconds: number;
}
const ITEM_HEIGHT = 32;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PRESETS_STORAGE_KEY = '@timer_presets';

// Preset timer options in seconds
const DEFAULT_PRESET_TIMERS: PresetTimer[] = [
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
];

// Rolling digit component
const RollingDigit: React.FC<{ value: string; colors: any }> = ({ value, colors }) => {
  const animatedValue = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      animatedValue.setValue(0);
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      prevValue.current = value;
    }
  }, [value, animatedValue]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.6, 1],
  });

  return (
    <Animated.Text
      style={[
        styles.timeText,
        { color: colors.textPrimary, transform: [{ translateY }], opacity }
      ]}
    >
      {value}
    </Animated.Text>
  );
};

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

  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(1);
  const [selectedSeconds, setSelectedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [presetTimers, setPresetTimers] = useState<PresetTimer[]>(DEFAULT_PRESET_TIMERS);
  const [editingPresetIndex, setEditingPresetIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editMinutes, setEditMinutes] = useState('');
  const [editSeconds, setEditSeconds] = useState('');
  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  // Load presets from storage
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const stored = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
        if (stored) {
          setPresetTimers(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    };
    loadPresets();
  }, []);

  // Save presets to storage
  const savePresets = async (newPresets: PresetTimer[]) => {
    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
      setPresetTimers(newPresets);
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  };
  const handleStart = () => {
    start();
    setIsPaused(false);
  };

  const handlePause = () => {
    pause();
    setIsPaused(true);
  };

  const handleReset = () => {
    reset();
    setIsPaused(false);
  };

  const handlePresetTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    setSelectedHours(hrs);
    setSelectedMinutes(mins);
    setSelectedSeconds(secs);
    setTime(seconds);

    // Scroll pickers to the preset values
    setTimeout(() => {
      hoursScrollRef.current?.scrollTo({ y: hrs * ITEM_HEIGHT, animated: true });
      minutesScrollRef.current?.scrollTo({ y: mins * ITEM_HEIGHT, animated: true });
      secondsScrollRef.current?.scrollTo({ y: secs * ITEM_HEIGHT, animated: true });
    }, 50);
  };

  const handleLongPressPreset = (index: number) => {
    const preset = presetTimers[index];
    const mins = Math.floor(preset.seconds / 60);
    const secs = preset.seconds % 60;

    setEditingPresetIndex(index);
    setEditLabel(preset.label);
    setEditMinutes(mins.toString());
    setEditSeconds(secs.toString());
  };

  const handleSaveEditedPreset = () => {
    if (editingPresetIndex === null) return;

    const mins = parseInt(editMinutes) || 0;
    const secs = parseInt(editSeconds) || 0;
    const totalSeconds = mins * 60 + secs;

    if (totalSeconds === 0) {
      Alert.alert('Invalid Time', 'Please enter a valid time greater than 0 seconds.');
      return;
    }

    const newPresets = [...presetTimers];
    newPresets[editingPresetIndex] = {
      label: editLabel.trim() || `${mins}m ${secs}s`,
      seconds: totalSeconds,
    };

    savePresets(newPresets);
    setEditingPresetIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingPresetIndex(null);
    setEditLabel('');
    setEditMinutes('');
    setEditSeconds('');
  };

  // Initialize picker values when modal opens
  useEffect(() => {
    if (isVisible && !isRunning) {
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      setSelectedHours(hrs);
      setSelectedMinutes(mins);
      setSelectedSeconds(secs);

      // Scroll to current values
      setTimeout(() => {
        hoursScrollRef.current?.scrollTo({ y: hrs * ITEM_HEIGHT, animated: false });
        minutesScrollRef.current?.scrollTo({ y: mins * ITEM_HEIGHT, animated: false });
        secondsScrollRef.current?.scrollTo({ y: secs * ITEM_HEIGHT, animated: false });
      }, 100);
      setIsPaused(false);
    }
  }, [isVisible]);

  // Update timer in real-time as user scrolls (but don't start it yet)
  useEffect(() => {
    if (!isRunning && !isPaused) {
      const totalSecs = selectedHours * 3600 + selectedMinutes * 60 + selectedSeconds;
      if (totalSecs > 0) {
        setTime(totalSecs);
      }
    }
  }, [selectedHours, selectedMinutes, selectedSeconds, isRunning, isPaused]);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    setter: (value: number) => void,
    maxValue: number
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, maxValue - 1));
    setter(clampedIndex);
  };

  const renderPickerColumn = (
    data: number[],
    selectedValue: number,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    scrollRef: React.RefObject<ScrollView | null>,
    label: string
  ) => {
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onScroll}
          scrollEnabled={!isRunning}
          nestedScrollEnabled={true}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * 2,
          }}
        >
          {data.map((value) => (
            <View key={value} style={styles.pickerItem}>
              <Text
                style={[
                  styles.pickerItemText,
                  { color: colors.textTertiary },
                  value === selectedValue && [styles.pickerItemTextSelected, { color: colors.textPrimary }],
                ]}
              >
                {value}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const progress = getProgress();
  const circumference = 2 * Math.PI * 120; // radius = 120

  // Split time into individual digits for rolling animation
  const timeString = formatTime(remainingSeconds);
  const timeChars = timeString.split('');

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: `rgba(0, 0, 0, ${colors.background === '#FCFCFC' ? '0.4' : '0.7'})` }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} testID="modal-backdrop" />
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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

          {!isRunning && !isPaused && (
            <View style={styles.presetsContainer}>
              {presetTimers.map((preset, index) => (
                <TouchableOpacity
                  key={`${preset.label}-${index}`}
                  style={[styles.presetButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => handlePresetTimer(preset.seconds)}
                  onLongPress={() => handleLongPressPreset(index)}
                  delayLongPress={500}
                >
                  <Text style={[styles.presetButtonText, { color: colors.textPrimary }]}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!isRunning && !isPaused && (
            <View style={styles.pickerContainer}>
              <View style={[styles.pickerHighlight, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} />
              <View style={styles.pickerRow}>
                <View style={styles.pickerGroup}>
                  {renderPickerColumn(
                    hours,
                    selectedHours,
                    (e) => handleScroll(e, setSelectedHours, 24),
                    hoursScrollRef,
                    'hours'
                  )}
                  <Text style={[styles.pickerUnitLabel, { color: colors.textPrimary }]}>h</Text>
                </View>
                <View style={styles.pickerGroup}>
                  {renderPickerColumn(
                    minutes,
                    selectedMinutes,
                    (e) => handleScroll(e, setSelectedMinutes, 60),
                    minutesScrollRef,
                    'min'
                  )}
                  <Text style={[styles.pickerUnitLabel, { color: colors.textPrimary }]}>m</Text>
                </View>
                <View style={styles.pickerGroup}>
                  {renderPickerColumn(
                    seconds,
                    selectedSeconds,
                    (e) => handleScroll(e, setSelectedSeconds, 60),
                    secondsScrollRef,
                    'sec'
                  )}
                  <Text style={[styles.pickerUnitLabel, { color: colors.textPrimary }]}>s</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
              <RotateCcw size={28} color={colors.textPrimary} />
            </TouchableOpacity>

            {!isRunning && !isPaused ? (
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton, { backgroundColor: colors.accent }]}
                onPress={() => {
                  handleStart();
                  onClose();
                }}
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

      <Modal visible={editingPresetIndex !== null} animationType="fade" transparent onRequestClose={handleCancelEdit}>
        <View style={[styles.editModalBackdrop, { backgroundColor: `rgba(0, 0, 0, ${colors.background === '#FCFCFC' ? '0.4' : '0.7'})` }]}>
          <View style={[styles.editModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.textPrimary }]}>Edit Preset</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.editModalBody}>
              <Text style={[styles.editModalLabel, { color: colors.textSecondary }]}>Label</Text>
              <TextInput
                style={[styles.editModalInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border }]}
                value={editLabel}
                onChangeText={setEditLabel}
                placeholder="e.g., 1m, Quick rest"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={[styles.editModalLabel, { color: colors.textSecondary, marginTop: 16 }]}>Time</Text>
              <View style={styles.editModalTimeRow}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.editModalInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border }]}
                    value={editMinutes}
                    onChangeText={setEditMinutes}
                    placeholder="Min"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Text style={[styles.editModalUnitLabel, { color: colors.textTertiary }]}>minutes</Text>
                </View>
                <Text style={[styles.editModalColon, { color: colors.textPrimary }]}>:</Text>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.editModalInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border }]}
                    value={editSeconds}
                    onChangeText={setEditSeconds}
                    placeholder="Sec"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={[styles.editModalUnitLabel, { color: colors.textTertiary }]}>seconds</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.editModalSaveButton, { backgroundColor: colors.accent }]}
                onPress={handleSaveEditedPreset}
              >
                <Text style={[styles.editModalSaveButtonText, { color: colors.surface }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  timeText: {
    fontSize: 64,
    fontWeight: '300',
    letterSpacing: -2,
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
  pickerContainer: {
    width: '100%',
    height: PICKER_HEIGHT,
    position: 'relative',
    marginBottom: 24,
    marginTop: 20,
  },
  pickerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 20,
    right: 20,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    zIndex: -1,
    pointerEvents: 'none',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: PICKER_HEIGHT,
  },
  pickerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  pickerColumn: {
    width: 70,
    height: PICKER_HEIGHT,
    position: 'relative',
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pickerItemText: {
    fontSize: 20,
    fontWeight: '400',
  },
  pickerItemTextSelected: {
    fontSize: 24,
    fontWeight: '500',
  },
  pickerUnitLabel: {
    fontSize: 20,
    fontWeight: '400',
    alignSelf: 'center',
    marginLeft: -15,
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

  editModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  editModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  editModalBody: {
    gap: 8,
  },
  editModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  editModalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editModalTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  editModalUnitLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  editModalColon: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  editModalSaveButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editModalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});