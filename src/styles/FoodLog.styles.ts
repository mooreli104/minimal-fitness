import { StyleSheet } from 'react-native';
import { ThemeColors } from '../context/ThemeContext';

export const getFoodLogStyles = (colors: ThemeColors) => StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionInner: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  sectionCalories: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingBottom: 120,
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8
  },
  inputFlex: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center"
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600"
  },
  timePickerBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingBottom: 120,
  },
  timePickerContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  doneButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16
  },
  doneButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600"
  },
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