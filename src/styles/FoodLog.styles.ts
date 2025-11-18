import { StyleSheet } from 'react-native';
import { ThemeColors } from '../context/ThemeContext';

export const getFoodLogStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 120, gap: 24 },
  yesterdayIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    marginTop: -30,
    marginBottom: -10,
  },
  yesterdayText: {
    fontSize: 13,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  actionButtons: {
    gap: 12,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  copyButtonText: { fontSize: 16, color: colors.textSecondary, fontWeight: "500" },
  templateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  templateButtonText: { fontSize: 16, color: colors.textSecondary, fontWeight: "500" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
});