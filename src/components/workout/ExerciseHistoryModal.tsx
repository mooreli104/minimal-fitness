// src/components/workout/ExerciseHistoryModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ExerciseHistoryEntry } from '../../types';
import { findExerciseHistory } from '../../services/workoutStorage.service';

interface Props {
  isVisible: boolean;
  exerciseName: string;
  currentDate: Date;
  onClose: () => void;
}

export const ExerciseHistoryModal = ({ isVisible, exerciseName, currentDate, onClose }: Props) => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isVisible || !exerciseName.trim()) return;
    setLoading(true);
    findExerciseHistory(exerciseName, currentDate)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [isVisible, exerciseName, currentDate]);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View
          style={[styles.container, { backgroundColor: colors.cardBackground }]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{exerciseName}</Text>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} color={colors.accent} />
          ) : history.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>No previous entries found.</Text>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {history.map((entry, i) => (
                <View key={i} style={[styles.entry, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <View style={styles.entryHeader}>
                    <Text style={[styles.entryDate, { color: colors.textPrimary }]}>{formatDate(entry.date)}</Text>
                    <Text style={[styles.entryWorkout, { color: colors.textTertiary }]}>{entry.workoutName}</Text>
                  </View>
                  <View style={styles.entryDetails}>
                    {entry.target ? <Text style={[styles.detail, { color: colors.textSecondary }]}>Target: {entry.target}</Text> : null}
                    {entry.actual ? <Text style={[styles.detail, { color: colors.textSecondary }]}>Actual: {entry.actual}</Text> : null}
                    {entry.weight ? <Text style={[styles.detail, { color: colors.accent }]}>@ {entry.weight}</Text> : null}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={[styles.closeButton, { borderTopColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.accent }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
    gap: 12,
  },
  detail: {
    fontSize: 14,
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
});
