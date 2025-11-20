/**
 * WaterTracker Component
 * Track daily water intake with increment/decrement controls
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Droplet, Plus, Minus } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface WaterTrackerProps {
  glasses: number;
  goal: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  glasses,
  goal,
  onIncrement,
  onDecrement,
}) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);

  const progress = Math.min((glasses / goal) * 100, 100);
  const isGoalReached = glasses >= goal;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.blue}15` }]}>
            <Droplet size={20} color={colors.blue} strokeWidth={2} fill={colors.blue} />
          </View>
          <Text style={styles.title}>Water Intake</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{glasses}</Text>
          <Text style={styles.goalText}>/ {goal}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: isGoalReached ? colors.green : colors.blue,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {isGoalReached ? 'Goal reached! 🎉' : `${Math.round(progress)}%`}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, glasses === 0 && styles.buttonDisabled]}
          onPress={onDecrement}
          disabled={glasses === 0}
          activeOpacity={0.7}
        >
          <Minus size={20} color={glasses === 0 ? colors.textTertiary : colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={styles.glassesLabel}>glasses</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onIncrement}
          activeOpacity={0.7}
        >
          <Plus size={20} color={colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: any, theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
      ...(theme === 'light'
        ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }
        : {}),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    valueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    value: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    goalText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    progressBarContainer: {
      gap: 8,
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    button: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    glassesLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      minWidth: 60,
      textAlign: 'center',
    },
  });
