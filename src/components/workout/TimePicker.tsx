import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TimePickerProps {
  selectedHours: number;
  selectedMinutes: number;
  selectedSeconds: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
  onScrollEnd: (time: { hours: number; minutes: number; seconds: number }) => void;
  isRunning: boolean;
}

const ITEM_HEIGHT = 32;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const seconds = Array.from({ length: 60 }, (_, i) => i);

export const TimePicker: React.FC<TimePickerProps> = ({
  selectedHours,
  selectedMinutes,
  selectedSeconds,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  onScrollEnd,
  isRunning,
}) => {
  const { colors } = useTheme();
  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

  // Track if we're programmatically scrolling to prevent feedback loops (separate flag for each picker)
  const isScrollingHoursProgrammatically = useRef(false);
  const isScrollingMinutesProgrammatically = useRef(false);
  const isScrollingSecondsProgrammatically = useRef(false);

  // Local state to track current scroll positions for immediate highlighting
  const [currentHour, setCurrentHour] = useState(selectedHours);
  const [currentMinute, setCurrentMinute] = useState(selectedMinutes);
  const [currentSecond, setCurrentSecond] = useState(selectedSeconds);

  useEffect(() => {
    if (hoursScrollRef.current) {
      isScrollingHoursProgrammatically.current = true;
      hoursScrollRef.current.scrollTo({ y: selectedHours * ITEM_HEIGHT, animated: false });
      setCurrentHour(selectedHours);
      setTimeout(() => {
        isScrollingHoursProgrammatically.current = false;
      }, 50);
    }
  }, [selectedHours]);

  useEffect(() => {
    if (minutesScrollRef.current) {
      isScrollingMinutesProgrammatically.current = true;
      minutesScrollRef.current.scrollTo({ y: selectedMinutes * ITEM_HEIGHT, animated: false });
      setCurrentMinute(selectedMinutes);
      setTimeout(() => {
        isScrollingMinutesProgrammatically.current = false;
      }, 50);
    }
  }, [selectedMinutes]);

  useEffect(() => {
    if (secondsScrollRef.current) {
      isScrollingSecondsProgrammatically.current = true;
      secondsScrollRef.current.scrollTo({ y: selectedSeconds * ITEM_HEIGHT, animated: false });
      setCurrentSecond(selectedSeconds);
      setTimeout(() => {
        isScrollingSecondsProgrammatically.current = false;
      }, 50);
    }
  }, [selectedSeconds]);

  const handleHoursScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingHoursProgrammatically.current) return;

    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, 23));

    setCurrentHour(clampedIndex);
    onHoursChange(clampedIndex);
    onScrollEnd({
      hours: clampedIndex,
      minutes: currentMinute,
      seconds: currentSecond,
    });
  };

  const handleMinutesScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingMinutesProgrammatically.current) return;

    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, 59));

    setCurrentMinute(clampedIndex);
    onMinutesChange(clampedIndex);
    onScrollEnd({
      hours: currentHour,
      minutes: clampedIndex,
      seconds: currentSecond,
    });
  };

  const handleSecondsScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingSecondsProgrammatically.current) return;

    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, 59));

    setCurrentSecond(clampedIndex);
    onSecondsChange(clampedIndex);
    onScrollEnd({
      hours: currentHour,
      minutes: currentMinute,
      seconds: clampedIndex,
    });
  };

  const renderPickerColumn = (
    data: number[],
    selectedValue: number,
    onScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    scrollRef: React.RefObject<ScrollView | null>
  ) => {
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="center"
          decelerationRate="fast"
          scrollEventThrottle={16}
          onMomentumScrollEnd={onScrollEnd}
          scrollEnabled={!isRunning}
          nestedScrollEnabled={true}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * 2,
          }}
        >
          {data.map((value) => {
            const isSelected = value === selectedValue;
            return (
              <View key={value} style={styles.pickerItem}>
                <Text
                  style={[
                    styles.pickerItemText,
                    { color: colors.textTertiary },
                    isSelected && [styles.pickerItemTextSelected, { color: colors.textPrimary }],
                  ]}
                >
                  {value}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.pickerContainer}>
      <View style={[styles.pickerHighlight, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} />
      <View style={styles.pickerRow}>
        <View style={styles.pickerGroup}>
          {renderPickerColumn(hours, currentHour, handleHoursScrollEnd, hoursScrollRef)}
          <Text style={[styles.pickerUnitLabel, { color: colors.textPrimary }]}>h</Text>
        </View>
        <View style={styles.pickerGroup}>
          {renderPickerColumn(minutes, currentMinute, handleMinutesScrollEnd, minutesScrollRef)}
          <Text style={[styles.pickerUnitLabel, { color: colors.textPrimary }]}>m</Text>
        </View>
        <View style={styles.pickerGroup}>
          {renderPickerColumn(seconds, currentSecond, handleSecondsScrollEnd, secondsScrollRef)}
          <Text style={[styles.pickerUnitLabel, { color: colors.textPrimary }]}>s</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
