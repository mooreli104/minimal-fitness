import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../context/ThemeContext';

export const getAddFoodModalStyles = (colors: ThemeColors) => StyleSheet.create({
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
    width: "90%",
    maxWidth: 500,
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
    backgroundColor: colors.textPrimary,
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
    backgroundColor: colors.textPrimary,
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
});
