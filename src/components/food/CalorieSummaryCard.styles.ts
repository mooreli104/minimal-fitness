import { StyleSheet } from "react-native";
import { ThemeColors } from "../../context/ThemeContext";

export const getCalorieSummaryCardStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      marginBottom: 16,
    },
    leftSection: {
      flex: 1,
      justifyContent: "center",
    },
    calorieValue: {
      fontSize: 48,
      fontWeight: "700",
      color: colors.textPrimary,
      letterSpacing: -1,
    },
    calorieLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: "500",
    },
    rightSection: {
      alignItems: "center",
      justifyContent: "center",
    },
    progressContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    iconContainer: {
      position: "absolute",
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
  });
