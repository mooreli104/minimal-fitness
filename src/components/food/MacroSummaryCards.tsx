import React from "react";
import { View } from "react-native";
import { getMacroSummaryCardsStyles } from "./MacroSummaryCards.styles";
import MacroCard from "./MacroCard";

interface MacroSummaryCardsProps {
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

const MacroSummaryCards = ({ protein, carbs, fat }: MacroSummaryCardsProps) => {
  const styles = getMacroSummaryCardsStyles();

  return (
    <View style={styles.container}>
      <View style={styles.macroCard}>
        <MacroCard type="protein" current={protein.current} target={protein.target} />
      </View>
      <View style={styles.macroCard}>
        <MacroCard type="carbs" current={carbs.current} target={carbs.target} />
      </View>
      <View style={styles.macroCard}>
        <MacroCard type="fat" current={fat.current} target={fat.target} />
      </View>
    </View>
  );
};

export default MacroSummaryCards;
