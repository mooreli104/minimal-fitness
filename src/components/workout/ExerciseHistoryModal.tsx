// src/components/workout/ExerciseHistoryModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ExerciseHistoryEntry } from '../../types';
import { findExerciseHistory, findExerciseHistoryForDay } from '../../services/workoutStorage.service';

interface Props {
  isVisible: boolean;
  exerciseName: string;
  workoutDayName?: string;
  currentDate: Date;
  onClose: () => void;
}

export const ExerciseHistoryModal = ({ isVisible, exerciseName, workoutDayName, currentDate, onClose }: Props) => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isVisible || !exerciseName.trim()) return;
    setHistory([]);
    setLoading(true);
    const fetchHistory = workoutDayName
      ? findExerciseHistoryForDay(exerciseName, workoutDayName, currentDate)
      : findExerciseHistory(exerciseName, currentDate);
    fetchHistory
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [isVisible, exerciseName, workoutDayName, currentDate]);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{exerciseName}</Text>

          {loading ? (
            <ActivityIndicator style={styles.loadingIndicator} color={colors.accent} />
          ) : history.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>No previous entries found.</Text>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
              {history.map((entry, i) => (
                <View key={i} style={[styles.entry, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <View style={styles.entryHeader}>
                    <Text style={[styles.entryDate, { color: colors.textPrimary }]}>{formatDate(entry.date)}</Text>
                    <Text style={[styles.entryWorkout, { color: colors.textTertiary }]}>{entry.workoutName}</Text>
                  </View>
                  <View style={styles.entryDetails}>
                    <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Target</Text>
                    <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Actual</Text>
                    <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Weight</Text>
                  </View>
                  <View style={styles.entryDetails}>
                    <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{entry.target || '—'}</Text>
                    <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{entry.actual || '—'}</Text>
                    <Text style={[styles.detailValue, { color: colors.accent }]}>{entry.weight || '—'}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={[styles.closeButton, { borderTopColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.accent }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 16,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 32,
    fontSize: 15,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  entry: {
    paddingVertical: 14,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '600',
  },
  entryWorkout: {
    fontSize: 13,
  },
  entryDetails: {
    flexDirection: 'row',
  },
  detailLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    borderTopWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: { marginVertical: 32 },
});
