import { StyleSheet } from 'react-native';
import { ThemeColors } from '../context/ThemeContext';

export const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  illustrationWrapper: {
    width: 220,
    height: 220,
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 20,
    backgroundColor: colors.background,
    position: "absolute",
    top: 0,
    left: 0,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },
  button: {
    marginTop: 40,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: colors.background,
    fontWeight: "600",
    fontSize: 14,
  },
});