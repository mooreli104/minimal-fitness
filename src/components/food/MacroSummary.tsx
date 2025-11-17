import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MacroSummaryProps {
  protein: number;
  carbs: number;
  fat: number;
}

const MacroSummary = ({ protein, carbs, fat }: MacroSummaryProps) => (
  <View style={styles.macroContainer}>
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{protein}g</Text>
      <Text style={styles.macroLabel}>Protein</Text>
    </View>
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{carbs}g</Text>
      <Text style={styles.macroLabel}>Carbs</Text>
    </View>
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{fat}g</Text>
      <Text style={styles.macroLabel}>Fat</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
  },
  macroItem: { alignItems: "center" },
  macroValue: { fontSize: 16, fontWeight: "500" },
  macroLabel: { fontSize: 14, color: "#999", marginTop: 2 },
});

export default MacroSummary;
