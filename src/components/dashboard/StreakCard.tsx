/**
 * StreakCard Component
 * Displays a streak counter with icon and label
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Utensils } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface StreakCardProps {
  type: 'workout' | 'food';
  streak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ type, streak }) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);

  const isWorkout = type === 'workout';
  const icon = isWorkout ? Flame : Utensils;
  const label = isWorkout ? 'Workout Streak' : 'Food Log Streak';
  const iconColor = isWorkout ? colors.orange : colors.green;

  const IconComponent = icon;

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <IconComponent size={20} color={iconColor} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{streak}</Text>
          <Text style={styles.unit}>days</Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: any, theme: 'light' | 'dark') =>
  StyleSheet.create({
    card: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    value: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: 32,
    },
    unit: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textTertiary,
    },
  });
