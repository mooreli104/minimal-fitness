import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Trash2 } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { FoodEntry } from "../../types";

interface FoodRowItemProps {
  food: FoodEntry;
  onPress: () => void;
  onDelete: () => void;
  isLastItem: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.2;

const FoodRowItem = ({ food, onPress, onDelete, isLastItem }: FoodRowItemProps) => {
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

  const handlePress = () => {
    if (translateX.value !== 0) {
      translateX.value = withTiming(0, undefined, (isFinished) => {
        if (isFinished) runOnJS(onPress)();
      });
    } else {
      onPress();
    }
  };

  return (
    <View>
      <View style={styles.deleteActionContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Trash2 size={20} color="white" />
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={animatedStyle}>
          <TouchableOpacity style={[styles.foodRow, isLastItem && { borderBottomWidth: 0 }]} onPress={handlePress} activeOpacity={1}>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodMacros}>{macroLine}</Text>
            </View>
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "white",
  },
  foodName: { fontSize: 16, fontWeight: "500" },
  foodMacros: { fontSize: 13, color: "#999", marginTop: 4 },
  deleteActionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
});

export default FoodRowItem;
