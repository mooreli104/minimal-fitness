import { StyleSheet } from "react-native";

export const getMacroSummaryCardsStyles = () =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      marginBottom: 16,
    },
    macroCard: {
      flex: 1,
    },
  });
