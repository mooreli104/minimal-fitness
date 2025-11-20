/**
 * Analytics / Dashboard Screen
 * Displays 6 key fitness metrics in a minimal grid layout
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
import { Sparkline } from '../components/analytics/Sparkline';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';
import { useAnalytics } from '../hooks/useAnalytics';

export default function Analytics() {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);

  // Get real analytics data
  const {
    workoutsThisWeek,
    weeklyVolume,
    volumeChange,
    avgCalories,
    avgProtein,
    currentStreak,
    bodyweightData,
    isLoading,
  } = useAnalytics();

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
          <Text style={styles.subtitle}>Last 7 days</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          {/* Workouts This Week */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Workouts</Text>
            <Text style={styles.cardValue}>{workoutsThisWeek}</Text>
            <Text style={styles.cardSubtext}>This week</Text>
          </View>

          {/* Weekly Training Volume */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Volume</Text>
            <View style={styles.valueRow}>
              <Text style={styles.cardValue}>
                {weeklyVolume > 0 ? (weeklyVolume / 1000).toFixed(1) + 'k' : '0'}
              </Text>
              {weeklyVolume > 0 && (
                <View
                  style={[
                    styles.trendBadge,
                    {
                      backgroundColor:
                        volumeChange > 0
                          ? `${colors.green}15`
                          : `${colors.red}15`,
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
            <Text style={styles.cardSubtext}>lbs this week</Text>
          </View>

          {/* Average Calories */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Calories</Text>
            <Text style={styles.cardValue}>
              {avgCalories > 0 ? avgCalories.toLocaleString() : '—'}
            </Text>
            <Text style={styles.cardSubtext}>Daily avg</Text>
          </View>

          {/* Protein Intake */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Protein</Text>
            <Text style={styles.cardValue}>{avgProtein > 0 ? avgProtein + 'g' : '—'}</Text>
            <Text style={styles.cardSubtext}>Daily avg</Text>
          </View>

          {/* Current Streak */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Streak</Text>
            <Text style={styles.cardValue}>{currentStreak}</Text>
            <Text style={styles.cardSubtext}>Days active</Text>
          </View>

          {/* Bodyweight Sparkline */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Weight</Text>
            {bodyweightData.length > 0 ? (
              <>
                <View style={styles.sparklineContainer}>
                  <Sparkline
                    data={bodyweightData}
                    width={120}
                    height={40}
                    strokeColor={colors.accent}
                    strokeWidth={1.5}
                  />
                </View>
                <Text style={styles.cardSubtext}>
                  {bodyweightData[bodyweightData.length - 1]} lbs
                </Text>
              </>
            ) : (
              <Text style={styles.cardValue}>—</Text>
            )}
          </View>
        </View>
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
      marginBottom: 24,
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
