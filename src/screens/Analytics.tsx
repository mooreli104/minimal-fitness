/**
 * Analytics / Progress Screen
 * Displays interactive charts and metrics with time range selection
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TimeRangeSelector } from '../components/analytics/TimeRangeSelector';
import { CaloriesTrendChart } from '../components/analytics/CaloriesTrendChart';
import { MacroStackedBarChart } from '../components/analytics/MacroStackedBarChart';
import { StreakSparkline } from '../components/analytics/StreakSparkline';
import { VolumeSparkline } from '../components/analytics/VolumeSparkline';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';
import { useAnalyticsCharts } from '../hooks/useAnalyticsCharts';

export default function Analytics() {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);

  const {
    timeRange,
    dailyData,
    aggregatedData,
    workoutsCount,
    totalVolume,
    avgCalories,
    avgProtein,
    avgCarbs,
    avgFat,
    currentStreak,
    isLoading,
    changeTimeRange,
  } = useAnalyticsCharts();

  // Calculate volume change (compare first half vs second half of period)
  const halfwayIndex = Math.floor(dailyData.length / 2);
  const firstHalfVolume = dailyData
    .slice(0, halfwayIndex)
    .reduce((sum, d) => sum + d.volume, 0);
  const secondHalfVolume = dailyData
    .slice(halfwayIndex)
    .reduce((sum, d) => sum + d.volume, 0);
  const volumeChange =
    firstHalfVolume > 0
      ? Math.round(((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Track your fitness journey</Text>
        </View>

        {/* Time Range Selector */}
        <TimeRangeSelector selected={timeRange} onSelect={changeTimeRange} />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            {/* Calories Trend Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Calorie Intake</Text>
              <CaloriesTrendChart data={aggregatedData} height={220} />
            </View>

            {/* Macros Stacked Bar Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Macronutrients</Text>
              <MacroStackedBarChart
                data={aggregatedData}
                avgProtein={avgProtein}
                avgCarbs={avgCarbs}
                avgFat={avgFat}
                height={200}
              />
            </View>

            {/* Stats Grid with Sparklines */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.grid}>
                {/* Workouts */}
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Workouts</Text>
                  <Text style={styles.cardValue}>{workoutsCount}</Text>
                  <Text style={styles.cardSubtext}>
                    {timeRange === 'day'
                      ? 'Today'
                      : timeRange === 'week'
                      ? 'This week'
                      : `Last ${
                          timeRange === 'month' ? '30' : timeRange === '3months' ? '90' : '365'
                        } days`}
                  </Text>
                </View>

                {/* Weekly Training Volume */}
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

                {/* Average Calories */}
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Avg Calories</Text>
                  <Text style={styles.cardValue}>
                    {avgCalories > 0 ? avgCalories.toLocaleString() : '—'}
                  </Text>
                  <Text style={styles.cardSubtext}>Daily average</Text>
                </View>

                {/* Current Streak */}
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Streak</Text>
                  <Text style={styles.cardValue}>{currentStreak}</Text>
                  {dailyData.length > 0 && (
                    <View style={styles.sparklineContainer}>
                      <StreakSparkline
                        data={dailyData}
                        currentStreak={currentStreak}
                        width={120}
                        height={32}
                      />
                    </View>
                  )}
                  <Text style={styles.cardSubtext}>Days active</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const getStyles = (colors: any, theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 120,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.textSecondary,
      marginBottom: 16,
    },
    loadingContainer: {
      marginTop: 60,
      alignItems: 'center',
    },
    section: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
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
      fontWeight: '500',
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
