import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Plus, Moon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { WorkoutDay } from '../../types';
import ProgramDayCard from './ProgramDayCard';

interface ProgramEditorProps {
  isVisible: boolean;
  onClose: () => void;
  program: WorkoutDay[];
  onAddDay: (name: string) => void;
  onRenameDay: (dayId: number, name: string) => void;
  onDuplicateDay: (dayId: number) => void;
  onDeleteDay: (dayId: number) => void;
  onToggleRestDay: (dayId: number) => void;
  onReorderDays: (newOrder: WorkoutDay[]) => void;
  onAddExercise: (dayId: number) => void;
  onUpdateExercise: (dayId: number, exerciseId: number, field: 'name' | 'target', value: string) => void;
  onRemoveExercise: (dayId: number, exerciseId: number) => void;
  onAddRestDay?: () => void;
}

export default function ProgramEditor({
  isVisible,
  onClose,
  program,
  onAddDay,
  onRenameDay,
  onDuplicateDay,
  onDeleteDay,
  onToggleRestDay,
  onReorderDays,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onAddRestDay,
}: ProgramEditorProps) {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [expandedDayId, setExpandedDayId] = useState<number | null>(null);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [newDayName, setNewDayName] = useState('');

  const handleToggleExpand = (dayId: number) => {
    setExpandedDayId((prev) => (prev === dayId ? null : dayId));
  };

  const handleAddDaySubmit = () => {
    const trimmed = newDayName.trim();
    if (trimmed) {
      onAddDay(trimmed);
    }
    setNewDayName('');
    setIsAddingDay(false);
  };

  const handleAddDayCancel = () => {
    setNewDayName('');
    setIsAddingDay(false);
  };

  const handleAddRestDay = () => {
    if (onAddRestDay) {
      onAddRestDay();
    } else {
      onAddDay('Rest Day');
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
        edges={['left', 'right', 'bottom']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Program</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {program.map((day) => (
              <ProgramDayCard
                key={day.id}
                day={day}
                isExpanded={expandedDayId === day.id}
                onToggleExpand={() => handleToggleExpand(day.id)}
                onRename={(newName) => onRenameDay(day.id, newName)}
                onDuplicate={() => onDuplicateDay(day.id)}
                onDelete={() => onDeleteDay(day.id)}
                onToggleRest={() => onToggleRestDay(day.id)}
                onAddExercise={() => onAddExercise(day.id)}
                onUpdateExercise={(exerciseId, field, value) =>
                  onUpdateExercise(day.id, exerciseId, field, value)
                }
                onRemoveExercise={(exerciseId) => onRemoveExercise(day.id, exerciseId)}
              />
            ))}

            {program.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No days in your program yet. Add a workout or rest day to get started.
                </Text>
              </View>
            )}

            {/* Inline add day input */}
            {isAddingDay && (
              <View style={[styles.addDayInputContainer, { backgroundColor: colors.surface }]}>
                <TextInput
                  style={[styles.addDayInput, { color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
                  value={newDayName}
                  onChangeText={setNewDayName}
                  placeholder="Day name..."
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddDaySubmit}
                  keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
                />
                <TouchableOpacity
                  style={[styles.addDayConfirmButton, { backgroundColor: colors.accent }]}
                  onPress={handleAddDaySubmit}
                >
                  <Text style={[styles.addDayConfirmText, { color: colors.background }]}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addDayCancelButton} onPress={handleAddDayCancel}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: colors.accent }]}
              onPress={() => setIsAddingDay(true)}
            >
              <Plus size={18} color={colors.background} />
              <Text style={[styles.footerButtonText, { color: colors.background }]}>Add Workout Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButtonSecondary, { borderColor: colors.border }]}
              onPress={handleAddRestDay}
            >
              <Moon size={18} color={colors.textSecondary} />
              <Text style={[styles.footerButtonSecondaryText, { color: colors.textSecondary }]}>Add Rest Day</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },

  content: {
    padding: 16,
    gap: 12,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
  },

  addDayInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  addDayInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addDayConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addDayConfirmText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addDayCancelButton: {
    padding: 6,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
