import React from 'react';
import { View, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Trash2, GripVertical, Clock } from 'lucide-react-native';
import { Exercise } from '../../types';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';
import { UI } from '../../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExerciseRowProps {
  item: Exercise;
  previousExercise?: Exercise;
  onExerciseChange: (id: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (id: number) => void;
  onShowHistory?: (exerciseName: string) => void;
  drag?: () => void;
  isActive?: boolean;
}

const ExerciseRow = ({ item, previousExercise, onExerciseChange, onDeleteExercise, onShowHistory, drag, isActive }: ExerciseRowProps) => {
  const { colors, theme } = useTheme();
  const styles = getWorkoutStyles(colors);
  const translateX = useSharedValue(0);
  const swipeThreshold = -SCREEN_WIDTH * UI.SWIPE_THRESHOLD_PERCENTAGE;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onUpdate((event) => {
      translateX.value = Math.max(-UI.MAX_SWIPE_DISTANCE, Math.min(0, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX < swipeThreshold) {
        translateX.value = withTiming(-UI.MAX_SWIPE_DISTANCE);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.exerciseRowContainer, isActive && { opacity: 0.9 }]}>
      <View style={styles.exerciseDeleteActionContainer}>
        <TouchableOpacity style={styles.exerciseDeleteButton} onPress={() => onDeleteExercise(item.id)}>
          <Trash2 size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={[styles.row, animatedStyle]}>
          {/* Drag handle */}
          <TouchableOpacity
            onLongPress={drag}
            delayLongPress={150}
            style={{ paddingHorizontal: 6, justifyContent: 'center' }}
          >
            <GripVertical size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Exercise name + history button */}
          <View style={[styles.exerciseCol, { flexDirection: 'row', alignItems: 'center' }]}>
            <TextInput
              style={[styles.cell, { flex: 1 }]}
              value={item.name}
              placeholder="Exercise Name"
              placeholderTextColor={colors.textSecondary}
              scrollEnabled={false}
              multiline
              numberOfLines={2}
              textAlignVertical="center"
              onChangeText={(text) => onExerciseChange(item.id, 'name', text)}
              keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
            />
            {onShowHistory && (
              <TouchableOpacity
                onPress={() => onShowHistory(item.name)}
                style={{ paddingLeft: 4, paddingRight: 2 }}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Clock size={14} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={[styles.cell, styles.targetActualCol]}
            value={item.target}
            placeholder={previousExercise?.target || "3x8"}
            placeholderTextColor={colors.textSecondary}
            scrollEnabled={false}
            onChangeText={(text) => onExerciseChange(item.id, 'target', text)}
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
          <TextInput
            style={[styles.cell, styles.targetActualCol]}
            value={item.actual}
            placeholder={previousExercise?.actual || "SetxRep"}
            placeholderTextColor={colors.textSecondary}
            scrollEnabled={false}
            onChangeText={(text) => onExerciseChange(item.id, 'actual', text)}
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.weight}
            placeholder={previousExercise?.weight || "-"}
            placeholderTextColor={colors.textSecondary}
            scrollEnabled={false}
            onChangeText={(text) => onExerciseChange(item.id, 'weight', text)}
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

export default ExerciseRow;
