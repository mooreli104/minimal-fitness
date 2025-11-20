/**
 * QuickStats Component
 * Displays volume and calories in a compact grid
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { VolumeSparkline } from '../analytics/VolumeSparkline';
import type { DailyDataPoint } from '../../hooks/useAnalyticsCharts';

interface QuickStatsProps {
  totalVolume: number;
  avgCalories: number;
  volumeChange: number;
  dailyData: DailyDataPoint[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalVolume,
  avgCalories,
  volumeChange,
  dailyData,
}) => {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);

  return (
    <View style={styles.grid}>
      {/* Volume */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Volume</Text>
        <View style={styles.valueRow}>
          <Text style={styles.cardValue}>
            {totalVolume > 0 ? (totalVolume / 1000).toFixed(1) + 'k' : '0'}
          </Text>
          {volumeChange !== 0 && (
            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor:
                    volumeChange > 0 ? `${colors.green}15` : `${colors.red}15`,
                },
              ]}
            >
              {volumeChange > 0 ? (
                <TrendingUp size={12} color={colors.green} strokeWidth={2} />
              ) : (
                <TrendingDown size={12} color={colors.red} strokeWidth={2} />
              )}
              <Text
                style={[
                  styles.trendText,
                  {
                    color: volumeChange > 0 ? colors.green : colors.red,
                  },
                ]}
              >
                {Math.abs(volumeChange)}%
              </Text>
            </View>
          )}
        </View>
        {dailyData.length > 0 && (
          <View style={styles.sparklineContainer}>
            <VolumeSparkline data={dailyData} width={120} height={32} />
          </View>
        )}
        <Text style={styles.cardSubtext}>Total lbs lifted</Text>
      </View>

      {/* Avg Calories */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Avg Calories</Text>
        <Text style={styles.cardValue}>
          {avgCalories > 0 ? avgCalories.toLocaleString() : '—'}
        </Text>
        <Text style={styles.cardSubtext}>Daily average</Text>
      </View>
    </View>
  );
};

const getStyles = (colors: any, theme: 'light' | 'dark') =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    card: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      minHeight: 110,
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
    cardLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    cardValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    cardSubtext: {
      fontSize: 13,
      fontWeight: '400',
      color: colors.textTertiary,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 6,
    },
    trendText: {
      fontSize: 11,
      fontWeight: '600',
    },
    sparklineContainer: {
      marginVertical: 8,
      alignItems: 'flex-start',
    },
  });
