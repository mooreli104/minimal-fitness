import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { CheckCircle } from 'lucide-react-native';

interface TimerCompleteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export const TimerCompleteModal: React.FC<TimerCompleteModalProps> = ({
  isVisible,
  onClose,
  onRestart,
}) => {
  const { colors, theme } = useTheme();

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.iconContainer}>
            <CheckCircle size={64} color={theme === 'dark' ? '#FFFFFF' : colors.primary} strokeWidth={2} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Timer Complete!
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Your workout timer has finished
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.restartButton,
                { backgroundColor: colors.primary },
                pressed && styles.buttonPressed,
              ]}
              onPress={onRestart}
            >
              <Text style={[styles.buttonText, { color: colors.surface }]}>
                Restart Timer
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.closeButton,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButton: {
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
