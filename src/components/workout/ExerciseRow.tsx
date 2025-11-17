import React from 'react';
import { View, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { Exercise } from '../../types';
import { styles } from '../../styles/Workout.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExerciseRowProps {
  item: Exercise;
  onExerciseChange: (id: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (id: number) => void;
}

const ExerciseRow = ({ item, onExerciseChange, onDeleteExercise }: ExerciseRowProps) => {
  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.2;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.max(-100, Math.min(0, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-100);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.exerciseRowContainer}>
      <View style={styles.exerciseDeleteActionContainer}>
        <TouchableOpacity style={styles.exerciseDeleteButton} onPress={() => onDeleteExercise(item.id)}>
          <Trash2 size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={[styles.row, animatedStyle]}>
          <TextInput
            style={[styles.cell, styles.exerciseCol]}
            value={item.name}
            placeholder="Exercise Name"
            multiline
            onChangeText={(text) => onExerciseChange(item.id, 'name', text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.sets}
            keyboardType="number-pad"
            onChangeText={(text) => onExerciseChange(item.id, 'sets', text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.reps}
            keyboardType="default"
            onChangeText={(text) => onExerciseChange(item.id, 'reps', text)}
          />
          <TextInput
            style={[styles.cell, styles.numberCol]}
            value={item.weight}
            keyboardType="number-pad"
            onChangeText={(text) => onExerciseChange(item.id, 'weight', text)}
          />
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

export default ExerciseRow;
