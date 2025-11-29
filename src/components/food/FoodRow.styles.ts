import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../context/ThemeContext';

export const getFoodRowStyles = (colors: ThemeColors) => StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  swipeableContent: {
    width: '100%',
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
  },
  foodRowConsumed: {
    // Don't use opacity here as it makes the background transparent
    // and reveals the action buttons underneath
  },
  foodName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  foodNameConsumed: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
    opacity: 0.6,
  },
  foodMacros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  foodMacrosConsumed: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  consumedActionContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    width: 100,
  },
  consumedButton: {
    backgroundColor: '#4CAF50', // Green for consumed/eaten
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
  deleteActionContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    width: 100,
  },
  deleteButton: {
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
  },
});
