import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { WorkoutDay } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ChangeDayModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
  programDays: WorkoutDay[];
  onAdd: () => void;
  onDelete: (id: number) => void;
}

const WorkoutDayRow = ({ day, onSelect, onDelete }: { day: WorkoutDay, onSelect: (name: string) => void, onDelete: () => void }) => {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -80;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.max(-100, Math.min(0, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-100, {}, () => runOnJS(onDelete)());
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View>
      <View style={styles.sheetDeleteActionContainer}>
        <TouchableOpacity style={styles.sheetDeleteButton} onPress={onDelete}>
          <Trash2 size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={animatedStyle}>
          <TouchableOpacity style={[styles.sheetOption, { backgroundColor: colors.cardBackground }]} onPress={() => onSelect(day.name)}>
            <Text style={[styles.sheetOptionText, { color: colors.textPrimary }]}>{day.name}</Text>
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

export const ChangeDayModal = ({ isVisible, onClose, onSelect, programDays, onAdd, onDelete }: ChangeDayModalProps) => {
  const { colors } = useTheme();

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.cardBackground }]} onStartShouldSetResponder={() => true}>
          <Text style={[styles.sheetTitle, { color: colors.textSecondary, borderBottomColor: colors.border }]}>Change Workout Day</Text>
          <ScrollView style={[styles.sheetOptionsContainer, { backgroundColor: colors.surface }]}>
            <GestureHandlerRootView>
              {programDays.filter(day => !day.isRest).map((day, index) => (
                <React.Fragment key={day.id}>
                  <WorkoutDayRow day={day} onSelect={onSelect} onDelete={() => onDelete(day.id)} />
                  {index < programDays.length - 1 && <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />}
                </React.Fragment>
              ))}
            </GestureHandlerRootView>
          </ScrollView>
          <TouchableOpacity style={[styles.sheetAction, { backgroundColor: colors.surface }]} onPress={onAdd}>
            <Plus size={16} color={colors.textPrimary} />
            <Text style={[styles.sheetActionText, { color: colors.textPrimary }]}>Add New Day</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sheetCancel, { backgroundColor: colors.surface }]} onPress={onClose}>
            <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    marginHorizontal: 16,
    marginBottom: 48,
    borderRadius: 16,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetOptionsContainer: {
    maxHeight: 300,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderRadius: 12,
  },
  sheetOption: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetOptionText: {
    fontSize: 18,
    fontWeight: '500',
  },
  sheetDivider: {
    height: 1,
    marginLeft: 16,
  },
  sheetAction: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetActionText: {
    fontSize: 18,
    fontWeight: '500',
  },
  sheetCancel: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 18,
    fontWeight: '500',
  },
  sheetDeleteActionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#DC2626',
  },
  sheetDeleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
  },
});
