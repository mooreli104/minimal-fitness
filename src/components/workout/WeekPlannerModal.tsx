import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { WorkoutDay, WeeklyPlan, DayOfWeek } from '../../types';
import { UI } from '../../utils/constants';
import { useTheme, ThemeColors } from '../../context/ThemeContext';

interface WeekPlannerModalProps {
  isVisible: boolean;
  onClose: () => void;
  weeklyPlan: WeeklyPlan;
  programDays: WorkoutDay[];
  onUpdateDay: (dayOfWeek: DayOfWeek, workoutDayId: number | null) => void;
  onClearPlan: () => void;
  onPopulateWeek: () => void;
}

interface DayPlannerRowProps {
  dayOfWeek: DayOfWeek;
  selectedWorkoutId: number | null;
  programDays: WorkoutDay[];
  onSelect: (dayOfWeek: DayOfWeek, workoutDayId: number | null) => void;
  colors: ThemeColors;
}

const DayPlannerRow = ({ dayOfWeek, selectedWorkoutId, programDays, onSelect, colors }: DayPlannerRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedWorkout = programDays.find(day => day.id === selectedWorkoutId);
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Display text based on selection
  const getDisplayText = () => {
    if (selectedWorkoutId === -1) return 'Rest Day';
    if (selectedWorkout) return selectedWorkout.name;
    return 'Not Planned';
  };

  return (
    <View style={styles.dayRow}>
      <TouchableOpacity
        style={styles.dayHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.dayName}>{dayOfWeek}</Text>
        <Text style={styles.selectedWorkout}>
          {getDisplayText()}
        </Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.workoutOptions}>
          <TouchableOpacity
            style={[styles.workoutOption, selectedWorkoutId === -1 && styles.workoutOptionSelected]}
            onPress={() => {
              onSelect(dayOfWeek, -1);
              setIsExpanded(false);
            }}
          >
            <Text style={[styles.workoutOptionText, selectedWorkoutId === -1 && styles.workoutOptionTextSelected]}>
              Rest Day
            </Text>
          </TouchableOpacity>
          {programDays.filter(day => !day.isRest).map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[styles.workoutOption, selectedWorkoutId === day.id && styles.workoutOptionSelected]}
              onPress={() => {
                onSelect(dayOfWeek, day.id);
                setIsExpanded(false);
              }}
            >
              <Text style={[styles.workoutOptionText, selectedWorkoutId === day.id && styles.workoutOptionTextSelected]}>
                {day.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const WeekPlannerModal = ({
  isVisible,
  onClose,
  weeklyPlan,
  programDays,
  onUpdateDay,
  onClearPlan,
  onPopulateWeek,
}: WeekPlannerModalProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Calendar size={20} color={colors.textPrimary} />
              <Text style={styles.title}>Plan Your Week</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.subtitle}>
              Assign a workout day to each day of the week
            </Text>
            <TouchableOpacity style={styles.populateButton} onPress={onPopulateWeek}>
              <Text style={styles.populateButtonText}>Auto-Populate Week</Text>
            </TouchableOpacity>
            {UI.WEEK_DAYS.map((day) => (
              <DayPlannerRow
                key={day}
                dayOfWeek={day as DayOfWeek}
                selectedWorkoutId={weeklyPlan[day]}
                programDays={programDays}
                onSelect={onUpdateDay}
                colors={colors}
              />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={onClearPlan}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: '100%',
    height: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 12,
  },
  populateButton: {
    backgroundColor: colors.green,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  populateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  dayRow: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectedWorkout: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  workoutOptions: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  workoutOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workoutOptionSelected: {
    backgroundColor: colors.link,
  },
  workoutOptionText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  workoutOptionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.link,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
