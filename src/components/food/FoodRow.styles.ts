import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../context/ThemeContext';

export const getFoodRowStyles = (colors: ThemeColors) => StyleSheet.create({
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  foodMacros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  deleteActionContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  deleteButton: {
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
});
