import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../context/ThemeContext';

export const getCalorieSummaryBarStyles = (colors: ThemeColors) => StyleSheet.create({
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
