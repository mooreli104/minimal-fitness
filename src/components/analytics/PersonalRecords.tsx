/**
 * Personal Records Component
 * Displays top personal records in a leaderboard style
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { PersonalRecord } from '../../hooks/usePersonalRecords';

interface PersonalRecordsProps {
  records: Map<string, PersonalRecord>;
  topN?: number;
}

export const PersonalRecords: React.FC<PersonalRecordsProps> = ({ records, topN = 5 }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Convert to array and sort by 1RM
  const sortedRecords = Array.from(records.values())
    .sort((a, b) => b.oneRepMax - a.oneRepMax)
    .slice(0, topN);

  if (sortedRecords.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No personal records yet</Text>
        <Text style={styles.emptySubtext}>Start logging workouts to track your PRs!</Text>
      </View>
    );
  }

  const formatExerciseName = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {sortedRecords.map((record, index) => (
        <View key={record.exerciseName} style={styles.recordCard}>
          {/* Rank Badge */}
          <View
            style={[
              styles.rankBadge,
              index === 0
                ? { backgroundColor: `${colors.yellow}20` }
                : { backgroundColor: `${colors.accent}15` },
            ]}
          >
            {index === 0 ? (
              <Trophy size={16} color={colors.yellow} strokeWidth={2} />
            ) : (
              <Text style={[styles.rankText, { color: colors.textSecondary }]}>#{index + 1}</Text>
            )}
          </View>

          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{formatExerciseName(record.exerciseName)}</Text>
            <Text style={styles.exerciseDate}>{formatDate(record.date)}</Text>
          </View>

          {/* PR Details */}
          <View style={styles.prDetails}>
            <Text style={styles.prWeight}>
              {record.weight} lbs
              {record.reps > 1 && ` × ${record.reps}`}
            </Text>
            <Text style={styles.prOneRM}>~{record.oneRepMax} lbs 1RM</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      gap: 8,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    emptyText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textTertiary,
      marginBottom: 4,
    },
    emptySubtext: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    recordCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 12,
    },
    rankBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankText: {
      fontSize: 13,
      fontWeight: '600',
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    exerciseDate: {
      fontSize: 11,
      fontWeight: '400',
      color: colors.textTertiary,
    },
    prDetails: {
      alignItems: 'flex-end',
    },
    prWeight: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    prOneRM: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textSecondary,
    },
  });
