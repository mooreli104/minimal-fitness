import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface RenameDayModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  newDayName: string;
  setNewDayName: (name: string) => void;
}

export const RenameDayModal = ({ isVisible, onClose, onSave, newDayName, setNewDayName }: RenameDayModalProps) => {
  const { theme } = useTheme();

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
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
          <View style={styles.renameActions}>
            <TouchableOpacity style={[styles.renameButton, styles.renameCancelButton]} onPress={onClose}>
              <Text style={styles.renameButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.renameButton, styles.renameSaveButton]} onPress={onSave}>
              <Text style={[styles.renameButtonText, { color: '#fff' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  renameModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  renameModalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  renameInput: {
    backgroundColor: '#f8f8f8',
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
    backgroundColor: '#e5e5e5',
  },
  renameSaveButton: {
    backgroundColor: '#000',
  },
  renameButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
