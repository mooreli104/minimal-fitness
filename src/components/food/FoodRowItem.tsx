import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Trash2, Check } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { FoodEntry } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { getFoodRowStyles } from './FoodRow.styles';

interface FoodRowItemProps {
  food: FoodEntry;
  onPress: () => void;
  onDelete: () => void;
  onToggleConsumed: () => void;
  isLastItem: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD_LEFT = -SCREEN_WIDTH * 0.2;
const SWIPE_THRESHOLD_RIGHT = SCREEN_WIDTH * 0.2;
const SWIPE_ACTION_WIDTH = 100;

const FoodRowItem = ({ food, onPress, onDelete, onToggleConsumed, isLastItem }: FoodRowItemProps) => {
  const { colors } = useTheme();
  const styles = getFoodRowStyles(colors);
  const macroParts: string[] = [];
  if (food.protein != null) macroParts.push(`P ${food.protein}g`);
  if (food.carbs != null) macroParts.push(`C ${food.carbs}g`);
  if (food.fat != null) macroParts.push(`F ${food.fat}g`);

  const timeString = new Date(food.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  macroParts.push(`${food.calories} kcal at ${timeString}`);
  const macroLine = macroParts.join(" • ");

  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Allow both left and right swipes
      translateX.value = Math.max(-SWIPE_ACTION_WIDTH, Math.min(SWIPE_ACTION_WIDTH, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD_LEFT) {
        // Swipe left - show delete
        translateX.value = withTiming(-SWIPE_ACTION_WIDTH);
      } else if (event.translationX > SWIPE_THRESHOLD_RIGHT) {
        // Swipe right - show consumed toggle
        translateX.value = withTiming(SWIPE_ACTION_WIDTH);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    if (translateX.value !== 0) {
      translateX.value = withTiming(0, undefined, (isFinished) => {
        if (isFinished) runOnJS(onPress)();
      });
    } else {
      onPress();
    }
  };

  const handleToggleConsumed = () => {
    translateX.value = withTiming(0);
    onToggleConsumed();
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Left action - Mark as consumed (visible on right swipe) */}
      <View style={styles.consumedActionContainer}>
        <TouchableOpacity style={styles.consumedButton} onPress={handleToggleConsumed}>
          <Check size={20} color="white" />
        </TouchableOpacity>
      </View>
      {/* Right action - Delete (visible on left swipe) */}
      <View style={styles.deleteActionContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Trash2 size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={[styles.swipeableContent, animatedStyle]}>
          <TouchableOpacity
            style={[
              styles.foodRow,
              isLastItem && { borderBottomWidth: 0 },
              food.consumed && styles.foodRowConsumed
            ]}
            onPress={handlePress}
            activeOpacity={1}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.foodName, food.consumed && styles.foodNameConsumed]}>
                {food.name}
              </Text>
              <Text style={[styles.foodMacros, food.consumed && styles.foodMacrosConsumed]}>
                {macroLine}
              </Text>
            </View>
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

export default FoodRowItem;
