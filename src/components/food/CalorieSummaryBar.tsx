import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface CalorieSummaryBarProps {
  consumed: number;
  target: number;
  onPressTarget: () => void;
}

const CalorieSummaryBar = ({ consumed, target, onPressTarget }: CalorieSummaryBarProps) => (
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

const styles = StyleSheet.create({
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryValue: { fontSize: 20, fontWeight: "600" },
  summaryLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default CalorieSummaryBar;
