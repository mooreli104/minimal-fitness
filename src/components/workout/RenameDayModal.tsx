import React, { useMemo } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, ThemeColors } from '../../context/ThemeContext';

interface RenameDayModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  newDayName: string;
  setNewDayName: (name: string) => void;
}

export const RenameDayModal = ({ isVisible, onClose, onSave, newDayName, setNewDayName }: RenameDayModalProps) => {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.renameModalBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.renameModalContainer} onStartShouldSetResponder={() => true}>
          <Text style={styles.renameModalTitle}>Rename Workout Day</Text>
          <TextInput
            style={styles.renameInput}
            value={newDayName}
            onChangeText={setNewDayName}
            autoFocus
            placeholder="Enter new name"
            placeholderTextColor={colors.textTertiary}
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
          <View style={styles.renameActions}>
            <TouchableOpacity style={[styles.renameButton, styles.renameCancelButton]} onPress={onClose}>
              <Text style={styles.renameCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.renameButton, styles.renameSaveButton]} onPress={onSave}>
              <Text style={styles.renameSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  renameModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  renameModalContainer: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: colors.textPrimary,
  },
  renameInput: {
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  renameActions: {
    flexDirection: 'row',
    gap: 12,
  },
  renameButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  renameCancelButton: {
    backgroundColor: colors.surfaceAlt,
  },
  renameSaveButton: {
    backgroundColor: colors.accent,
  },
  renameCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  renameSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
