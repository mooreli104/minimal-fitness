/**
 * Weight Input Modal Component
 * Modal for logging body weight with numeric input
 * Following React Native Best Practices 2025
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Scale } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface WeightInputModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (weight: number) => void;
  initialValue?: number;
}

export const WeightInputModal: React.FC<WeightInputModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  initialValue,
}) => {
  const { colors } = useTheme();
  const [weightInput, setWeightInput] = useState('');

  // Memoize styles based on colors to prevent recreation on every render
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Reset input when modal opens with initial value
  useEffect(() => {
    if (isVisible) {
      setWeightInput(initialValue ? initialValue.toString() : '');
    }
  }, [isVisible, initialValue]);

  // Memoize submit handler to prevent recreation
  const handleSubmit = useCallback(() => {
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0 && weight < 1000) {
      onSubmit(weight);
      onClose();
    }
  }, [weightInput, onSubmit, onClose]);

  // Memoize close handler
  const handleClose = useCallback(() => {
    setWeightInput('');
    onClose();
  }, [onClose]);

  // Validate input - memoized to prevent recreation
  const isValid = useMemo(() => {
    const weight = parseFloat(weightInput);
    return !isNaN(weight) && weight > 0 && weight < 1000;
  }, [weightInput]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View
            style={[styles.container, { backgroundColor: colors.cardBackground }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header with Icon */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                <Scale size={24} color={colors.cardBackground} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Log Weight</Text>
            </View>

            {/* Weight Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surface,
                    borderColor: isValid ? colors.accent : colors.border,
                  },
                ]}
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                placeholder="Enter weight (lbs)"
                placeholderTextColor={colors.textTertiary}
                autoFocus
                selectTextOnFocus
              />
              <Text style={[styles.hint, { color: colors.textTertiary }]}>
                Enter your current body weight
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface }]}
                onPress={handleClose}
              >
                <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  {
                    backgroundColor: isValid ? colors.accent : colors.border,
                    opacity: isValid ? 1 : 0.5,
                  },
                ]}
                onPress={handleSubmit}
                disabled={!isValid}
              >
                <Text style={[styles.buttonText, { color: colors.cardBackground }]}>
                  Save Weight
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

/**
 * Get styles function - memoized by component for performance
 * Following RN best practices: styles are created once and reused
 */
const getStyles = (colors: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-start', // Position from top instead of center
      alignItems: 'center',
      paddingTop: '25%', // Position modal in upper portion of screen
    },
    backdropTouch: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-start', // Position from top instead of center
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    container: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 24,
    },
    input: {
      fontSize: 32,
      fontWeight: '600',
      textAlign: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 2,
    },
    hint: {
      fontSize: 13,
      textAlign: 'center',
      marginTop: 8,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    cancelButton: {},
    submitButton: {},
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
