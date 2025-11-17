import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { WorkoutDay } from '../../types';

interface ChangeDayModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
  programDays: WorkoutDay[];
  onAdd: () => void;
  onDelete: (id: number) => void;
}

const WorkoutDayRow = ({ day, onSelect, onDelete }: { day: WorkoutDay, onSelect: (name: string) => void, onDelete: () => void }) => {
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
          <TouchableOpacity style={styles.sheetOption} onPress={() => onSelect(day.name)}>
            <Text style={styles.sheetOptionText}>{day.name}</Text>
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

export const ChangeDayModal = ({ isVisible, onClose, onSelect, programDays, onAdd, onDelete }: ChangeDayModalProps) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheetContainer} onStartShouldSetResponder={() => true}>
          <Text style={styles.sheetTitle}>Change Workout Day</Text>
          <ScrollView style={styles.sheetOptionsContainer}>
            <GestureHandlerRootView>
              {programDays.filter(day => !day.isRest).map((day, index) => (
                <React.Fragment key={day.id}>
                  <WorkoutDayRow day={day} onSelect={onSelect} onDelete={() => onDelete(day.id)} />
                  {index < programDays.length - 1 && <View style={styles.sheetDivider} />}
                </React.Fragment>
              ))}
            </GestureHandlerRootView>
          </ScrollView>
          <TouchableOpacity style={styles.sheetAction} onPress={onAdd}>
            <Plus size={16} color="#000" />
            <Text style={styles.sheetActionText}>Add New Day</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetCancel} onPress={onClose}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
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
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 48,
    borderRadius: 16,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sheetOptionsContainer: {
    maxHeight: 300,
    marginHorizontal: 16,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
    borderRadius: 12,
  },
  sheetOption: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  sheetOptionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginLeft: 16,
  },
  sheetAction: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#f8f8f8',
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
    color: '#000',
  },
  sheetCancel: {
    backgroundColor: '#f8f8f8',
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
    color: '#999',
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
