import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getFoodLogStyles } from "../../styles/FoodLog.styles";

interface CalorieSummaryBarProps {
  consumed: number;
  target: number;
  onPressTarget: () => void;
}

const CalorieSummaryBar = ({ consumed, target, onPressTarget }: CalorieSummaryBarProps) => {
  const { colors } = useTheme();
  const styles = getFoodLogStyles(colors);
  return (
    <View style={styles.summaryBar}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{consumed}</Text>
        <Text style={styles.summaryLabel}>Consumed</Text>
      </View>
      <TouchableOpacity style={styles.summaryItem} onPress={onPressTarget} activeOpacity={0.8}>
          <Text style={styles.summaryValue}>{target}</Text>
          <Text style={styles.summaryLabel}>Target</Text>
      </TouchableOpacity>
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: "#4ade80" }]}>{target - consumed}</Text>
        <Text style={styles.summaryLabel}>Remaining</Text>
      </View>
    </View>
  );
};

export default CalorieSummaryBar;
