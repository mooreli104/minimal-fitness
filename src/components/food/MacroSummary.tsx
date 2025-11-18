import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getFoodLogStyles } from "../../styles/FoodLog.styles";

interface MacroSummaryProps {
  protein: number;
  carbs: number;
  fat: number;
}

const MacroSummary = ({ protein, carbs, fat }: MacroSummaryProps) => {
  const { colors } = useTheme();
  const styles = getFoodLogStyles(colors);
  return (
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
};

export default MacroSummary;
