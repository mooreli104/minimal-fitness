import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../context/ThemeContext';

export const getMacroSummaryStyles = (colors: ThemeColors) => StyleSheet.create({
  macroContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  macroItem: {
    alignItems: "center"
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  macroLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2
  },
});
