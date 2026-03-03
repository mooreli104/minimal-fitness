import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { WorkoutDay } from '../../types';

interface ProgramDayCardProps {
  day: WorkoutDay;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRename: (newName: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleRest: () => void;
  onAddExercise: () => void;
  onUpdateExercise: (exerciseId: number, field: 'name' | 'target', value: string) => void;
  onRemoveExercise: (exerciseId: number) => void;
}

export default function ProgramDayCard({
  day,
  isExpanded,
  onToggleExpand,
  onRename,
  onDuplicate,
  onDelete,
  onToggleRest,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
}: ProgramDayCardProps) {
  const { colors, theme } = useTheme();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState(day.name);
  const renameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isRenaming) {
      setTimeout(() => renameInputRef.current?.focus(), 100);
    }
  }, [isRenaming]);

  const handleShowMenu = () => {
    Alert.alert(day.name, 'Choose an action', [
      { text: 'Rename', onPress: () => { setRenameText(day.name); setIsRenaming(true); } },
      { text: 'Duplicate', onPress: onDuplicate },
      { text: day.isRest ? 'Make Workout Day' : 'Make Rest Day', onPress: onToggleRest },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRenameSubmit = () => {
    const trimmed = renameText.trim();
    if (trimmed && trimmed !== day.name) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  const exerciseCount = day.exercises.length;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={onToggleExpand} activeOpacity={0.6}>
          {day.isRest ? null : (
            isExpanded
              ? <ChevronDown size={18} color={colors.textTertiary} />
              : <ChevronRight size={18} color={colors.textTertiary} />
          )}
          {isRenaming ? (
            <TextInput
              ref={renameInputRef}
              style={[styles.renameInput, { color: colors.textPrimary, borderBottomColor: colors.accent }]}
              value={renameText}
              onChangeText={setRenameText}
              onBlur={handleRenameSubmit}
              onSubmitEditing={handleRenameSubmit}
              returnKeyType="done"
              selectTextOnFocus
              keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
            />
          ) : (
            <Text
              style={[
                styles.dayName,
                { color: day.isRest ? colors.textTertiary : colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {day.name}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {day.isRest ? (
            <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.badgeText, { color: colors.textTertiary }]}>Rest</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.menuButton} onPress={handleShowMenu}>
            <MoreHorizontal size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded exercises section */}
      {isExpanded && !day.isRest && (
        <View style={[styles.exercisesSection, { borderTopColor: colors.border }]}>
          {day.exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseRow}>
              <TextInput
                style={[styles.exerciseNameInput, { color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
                value={exercise.name}
                placeholder="Exercise name"
                placeholderTextColor={colors.textTertiary}
                onChangeText={(text) => onUpdateExercise(exercise.id, 'name', text)}
                keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
              />
              <TextInput
                style={[styles.exerciseTargetInput, { color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
                value={exercise.target}
                placeholder="3x8"
                placeholderTextColor={colors.textTertiary}
                onChangeText={(text) => onUpdateExercise(exercise.id, 'target', text)}
                keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
              />
              <TouchableOpacity
                style={styles.removeExerciseButton}
                onPress={() => onRemoveExercise(exercise.id)}
              >
                <Trash2 size={16} color={colors.red} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addExerciseButton, { borderColor: colors.border }]}
            onPress={onAddExercise}
          >
            <Plus size={16} color={colors.accent} />
            <Text style={[styles.addExerciseText, { color: colors.accent }]}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dayName: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  renameInput: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 2,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  menuButton: {
    padding: 4,
  },

  exercisesSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    gap: 8,
    paddingTop: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exerciseTargetInput: {
    width: 64,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  removeExerciseButton: {
    padding: 6,
  },

  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
