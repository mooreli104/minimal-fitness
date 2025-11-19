import React from "react";
import { View, Text } from "react-native";
import { Zap, Wheat, Droplet } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { getMacroCardStyles } from "./MacroCard.styles";
import CircularProgress from "./CircularProgress";

type MacroType = "protein" | "carbs" | "fat";

interface MacroCardProps {
  type: MacroType;
  current: number;
  target: number;
}

const MacroCard = ({ type, current, target }: MacroCardProps) => {
  const { colors } = useTheme();
  const styles = getMacroCardStyles(colors);

  const remaining = target - current;
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = current > target;

  const getMacroConfig = () => {
    switch (type) {
      case "protein":
        return {
          label: "Protein",
          icon: Zap,
          color: colors.blue,
        };
      case "carbs":
        return {
          label: "Carbs",
          icon: Wheat,
          color: colors.green,
        };
      case "fat":
        return {
          label: "Fats",
          icon: Droplet,
          color: colors.orange,
        };
    }
  };

  const config = getMacroConfig();
  const Icon = config.icon;
  const statusText = isOver ? `${Math.abs(remaining)}g over` : `${remaining}g left`;

  return (
    <View style={styles.card}>
      <View style={styles.progressContainer}>
        <CircularProgress
          size={80}
          strokeWidth={6}
          progress={progress}
          trackColor={colors.border}
          progressColor={config.color}
        />
        <View style={styles.iconContainer}>
          <Icon size={20} strokeWidth={2.5} color={config.color} />
        </View>
      </View>

      <Text style={styles.macroValue}>{current}g</Text>
      <Text style={styles.macroLabel}>{config.label}</Text>
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
};

export default MacroCard;
