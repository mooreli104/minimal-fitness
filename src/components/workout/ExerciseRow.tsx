import React, { useRef } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Trash2, GripVertical, Clock } from 'lucide-react-native';
import { Exercise } from '../../types';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';

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
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.exerciseDeleteButton}
      onPress={() => {
        swipeableRef.current?.close();
        onDeleteExercise(item.id);
      }}
    >
      <Trash2 size={20} color="white" />
    </TouchableOpacity>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
      containerStyle={[styles.exerciseRowContainer, isActive && { opacity: 0.9 }]}
    >
      <View style={styles.row}>
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
      </View>
    </Swipeable>
  );
};

export default ExerciseRow;
