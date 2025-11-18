import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TimePickerProps {
  selectedHours: number;
  selectedMinutes: number;
  selectedSeconds: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
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
  isRunning,
}) => {
  const { colors } = useTheme();
  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

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

  return (
    <View style={styles.pickerContainer}>
      <View style={[styles.pickerHighlight, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} />
      <View style={styles.pickerRow}>
        <View style={styles.pickerGroup}>
          {renderPickerColumn(
            hours,
            selectedHours,
            (e) => handleScroll(e, onHoursChange, 24),
            hoursScrollRef,
            'hours'
          )}
          <Text style={[styles.pickerUnitLabel, { color: colors.textPrimary }]}>h</Text>
        </View>
        <View style={styles.pickerGroup}>
          {renderPickerColumn(
            minutes,
            selectedMinutes,
            (e) => handleScroll(e, onMinutesChange, 60),
            minutesScrollRef,
            'min'
          )}
          <Text style={[styles.pickerUnitLabel, { color: colors.textPrimary }]}>m</Text>
        </View>
        <View style={styles.pickerGroup}>
          {renderPickerColumn(
            seconds,
            selectedSeconds,
            (e) => handleScroll(e, onSecondsChange, 60),
            secondsScrollRef,
            'sec'
          )}
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
