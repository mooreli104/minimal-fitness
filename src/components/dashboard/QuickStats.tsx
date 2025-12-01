/**
 * QuickStats Component
 * Displays volume and weight tracking in a compact grid
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { VolumeSparkline } from '../analytics/VolumeSparkline';
import { useBodyWeight } from '../../hooks/useBodyWeight';
import { WeightInputModal } from '../common/WeightInputModal';
import BodyWeightCalendarModal from '../common/BodyWeightCalendarModal';
import { saveWeightEntry, getWeightForDate } from '../../services/weightStorage.service';
import { formatDateToKey } from '../../utils/formatters';
import type { DailyDataPoint } from '../../hooks/useAnalyticsCharts';

interface QuickStatsProps {
  totalVolume: number;
  volumeChange: number;
  dailyData: DailyDataPoint[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalVolume,
  volumeChange,
  dailyData,
}) => {
  const { colors, theme } = useTheme();
  const { latestWeight, logWeight, isLoading: weightLoading, refreshData } = useBodyWeight();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateWeight, setSelectedDateWeight] = useState<number | undefined>(undefined);

  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => getStyles(colors, theme), [colors, theme]);

  // Memoize callbacks to prevent child re-renders
  const handleLogWeight = useCallback(() => {
    setSelectedDate(new Date());
    setSelectedDateWeight(latestWeight?.weight);
    setShowWeightModal(true);
  }, [latestWeight]);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCalendarModal(true);
  }, []);

  const handleCalendarDateSelect = useCallback(async (date: Date) => {
    setShowCalendarModal(false);
    setSelectedDate(date);

    // Load existing weight for this date
    const dateKey = formatDateToKey(date);
    const existingEntry = await getWeightForDate(dateKey);
    setSelectedDateWeight(existingEntry?.weight);

    setShowWeightModal(true);
  }, []);

  const handleWeightSubmit = useCallback(async (weight: number) => {
    const dateKey = formatDateToKey(selectedDate);
    await saveWeightEntry(dateKey, weight);
    await refreshData();
  }, [selectedDate, refreshData]);

  const formatDateTime = useCallback((dateString: string, timestamp: number) => {
    // Parse date string as local date (YYYY-MM-DD) to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    // Format time from timestamp
    const time = new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) return `Today at ${time}`;
    if (isYesterday) return `Yesterday at ${time}`;

    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dateStr} at ${time}`;
  }, []);

  return (
    <>
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

      {/* Weight Tracking */}
      <TouchableOpacity
        style={styles.card}
        onPress={handleLogWeight}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Body Weight</Text>
          <Scale size={14} color={colors.accent} strokeWidth={2} />
        </View>
        <Text style={styles.cardValue}>
          {latestWeight ? `${latestWeight.weight} lbs` : '—'}
        </Text>
        <Text style={styles.cardSubtext}>
          {latestWeight
            ? formatDateTime(latestWeight.date, latestWeight.timestamp)
            : 'Tap to log, hold for history'}
        </Text>
      </TouchableOpacity>
    </View>

      {/* Weight Input Modal */}
      <WeightInputModal
        isVisible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSubmit={handleWeightSubmit}
        initialValue={selectedDateWeight}
      />

      {/* Body Weight Calendar Modal */}
      <BodyWeightCalendarModal
        isVisible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onDateSelect={handleCalendarDateSelect}
        selectedDate={selectedDate}
      />
    </>
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
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
