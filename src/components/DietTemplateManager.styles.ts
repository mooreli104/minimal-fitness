import { StyleSheet } from 'react-native';
import { ThemeColors } from '../context/ThemeContext';

export const getDietTemplateManagerStyles = (colors: ThemeColors) => StyleSheet.create({
  dmModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dmHeaderTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  dmCloseButton: {
    padding: 8
  },
  dmContent: {
    padding: 24,
    gap: 16
  },
  dmSectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dmCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dmCardContent: {
    flex: 1
  },
  dmCardTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.textPrimary,
  },
  dmCardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2
  },
  dmCardMeals: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  dmOptionsButton: {
    padding: 8,
    marginLeft: 12
  },
  dmEmptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  dmEmptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  dmEmptyStateSubtext: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  dmFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dmSaveButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  dmSaveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600"
  },
});
