import { StyleSheet } from "react-native";
import { ThemeColors } from "../../context/ThemeContext";

export const getMacroCardStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      minHeight: 160,
    },
    progressContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    iconContainer: {
      position: "absolute",
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    macroValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 8,
      letterSpacing: -0.5,
    },
    macroLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: "500",
    },
    statusText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
  });
