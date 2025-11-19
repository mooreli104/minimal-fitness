import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Flame } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { getCalorieSummaryCardStyles } from "./CalorieSummaryCard.styles";
import CircularProgress from "./CircularProgress";

interface CalorieSummaryCardProps {
  consumed: number;
  target: number;
  onPressTarget?: () => void;
}

const CalorieSummaryCard = ({ consumed, target, onPressTarget }: CalorieSummaryCardProps) => {
  const { colors } = useTheme();
  const styles = getCalorieSummaryCardStyles(colors);

  const remaining = target - consumed;
  const progress = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;

  const CardWrapper = onPressTarget ? TouchableOpacity : View;

  return (
    <CardWrapper style={styles.card} onPress={onPressTarget} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <Text style={styles.calorieValue}>{remaining}</Text>
        <Text style={styles.calorieLabel}>Calories left</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.progressContainer}>
          <CircularProgress
            size={100}
            strokeWidth={8}
            progress={progress}
            trackColor={colors.border}
            progressColor={colors.red}
          />
          <View style={styles.iconContainer}>
            <Flame size={24} strokeWidth={2} color={colors.red} fill={colors.red} />
          </View>
        </View>
      </View>
    </CardWrapper>
  );
};

export default CalorieSummaryCard;
