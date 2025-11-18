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
} from 'react-native';
import { Play, Pause, RotateCcw, X } from 'lucide-react-native';
import { useTimer } from '../../context/TimerContext';

interface CountdownTimerProps {
  isVisible: boolean;
  onClose: () => void;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

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
  } = useTimer();

  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(1);
  const [selectedSeconds, setSelectedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);

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
                  value === selectedValue && styles.pickerItemTextSelected,
                ]}
              >{value}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const progress = getProgress();
  const circumference = 2 * Math.PI * 120; // radius = 120

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* This TouchableOpacity will now only handle closing the modal when the area outside the container is pressed */}
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} testID="modal-backdrop" />
        <View style={styles.container}>
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
              <Text style={styles.timeText}>{formatTime(remainingSeconds)}</Text>
            </View>
          </View>

          {/* Scrolling time picker - visible when not running and not paused */}
          {!isRunning && !isPaused && (
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHighlight} />
              <View style={styles.pickerRow}>
                <View style={styles.pickerGroup}>
                  {renderPickerColumn(
                    hours,
                    selectedHours,
                    (e) => handleScroll(e, setSelectedHours, 24),
                    hoursScrollRef,
                    'hours'
                  )}<Text style={styles.pickerUnitLabel}>h</Text>
                </View>
                <View style={styles.pickerGroup}>
                  {renderPickerColumn(
                    minutes,
                    selectedMinutes,
                    (e) => handleScroll(e, setSelectedMinutes, 60),
                    minutesScrollRef,
                    'min'
                  )}<Text style={styles.pickerUnitLabel}>m</Text>
                </View>
                <View style={styles.pickerGroup}>
                  {renderPickerColumn(
                    seconds,
                    selectedSeconds,
                    (e) => handleScroll(e, setSelectedSeconds, 60),
                    secondsScrollRef,
                    'sec'
                  )}<Text style={styles.pickerUnitLabel}>s</Text>
                </View>
              </View>
            </View>
          )}

          {/* Control buttons */}
          <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
                <RotateCcw size={28} color="#000" />
              </TouchableOpacity>

              {!isRunning && !isPaused ? (
                <TouchableOpacity
                  style={[styles.controlButton, styles.playButton]}
                  onPress={() => {
                    handleStart();
                    onClose();
                  }}
                  disabled={remainingSeconds === 0}
                >
                  <Play size={36} color="#fff" fill="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.controlButton, styles.playButton]}
                  onPress={isRunning ? handlePause : handleStart}
                  disabled={remainingSeconds === 0}
                >
                  {isRunning ? (
                    <Pause size={36} color="#fff" fill="#fff" />
                  ) : (
                    <Play size={36} color="#fff" fill="#fff" />
                  )}
                </TouchableOpacity>
              )}

              <View style={styles.controlButton} />
          </View> 
        </View>
      </View>
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
    color: '#999',
    fontWeight: '400',
  },
  pickerItemTextSelected: {
    fontSize: 24,
    color: '#000',
    fontWeight: '500',
  },
  pickerUnitLabel: {
    fontSize: 20,
    color: '#000',
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
    backgroundColor: '#000',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
