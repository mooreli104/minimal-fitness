import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { PresetTimer } from './useTimerPresets';

interface PresetEditorModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (label: string, minutes: string, seconds: string) => void;
  preset: PresetTimer | null;
}

export const PresetEditorModal: React.FC<PresetEditorModalProps> = ({
  isVisible,
  onClose,
  onSave,
  preset,
}) => {
  const { colors } = useTheme();
  const [label, setLabel] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  useEffect(() => {
    if (preset) {
      const mins = Math.floor(preset.seconds / 60);
      const secs = preset.seconds % 60;
      setLabel(preset.label);
      setMinutes(mins.toString());
      setSeconds(secs.toString());
    }
  }, [preset]);

  const handleSave = () => {
    onSave(label, minutes, seconds);
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.editModalBackdrop, { backgroundColor: `rgba(0, 0, 0, ${colors.background === '#FCFCFC' ? '0.4' : '0.7'})` }]}>
        <View style={[styles.editModalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.editModalHeader}>
            <Text style={[styles.editModalTitle, { color: colors.textPrimary }]}>Edit Preset</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.editModalBody}>
            <Text style={[styles.editModalLabel, { color: colors.textSecondary }]}>Label</Text>
            <TextInput
              style={[styles.editModalInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border }]}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g., 1m, Quick rest"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[styles.editModalLabel, { color: colors.textSecondary, marginTop: 16 }]}>Time</Text>
            <View style={styles.editModalTimeRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.editModalInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border }]}
                  value={minutes}
                  onChangeText={setMinutes}
                  placeholder="Min"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={[styles.editModalUnitLabel, { color: colors.textTertiary }]}>minutes</Text>
              </View>
              <Text style={[styles.editModalColon, { color: colors.textPrimary }]}>:</Text>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.editModalInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.border }]}
                  value={seconds}
                  onChangeText={setSeconds}
                  placeholder="Sec"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.editModalUnitLabel, { color: colors.textTertiary }]}>seconds</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.editModalSaveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
            >
              <Text style={[styles.editModalSaveButtonText, { color: colors.surface }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  editModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  editModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  editModalBody: {
    gap: 8,
  },
  editModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  editModalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editModalTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  editModalUnitLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  editModalColon: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  editModalSaveButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editModalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
