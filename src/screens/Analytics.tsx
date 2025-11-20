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
import { WeightProgressionChart } from '../components/analytics/WeightProgressionChart';
import BottomNav from '../components/BottomNav';
import { useAnalyticsCharts } from '../hooks/useAnalyticsCharts';
import { useWeightProgression } from '../hooks/useWeightProgression';

export default function Analytics() {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);

  const {
    timeRange,
    aggregatedData,
    avgProtein,
    avgCarbs,
    avgFat,
    isLoading,
    changeTimeRange,
  } = useAnalyticsCharts();

  // Load weight progression data for top exercises
  const {
    progressionData,
    topExercises,
    isLoading: isProgressionLoading,
  } = useWeightProgression(90);

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

            {/* Weight Progression Section */}
            {!isProgressionLoading && topExercises.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weight Progression</Text>
                <Text style={styles.sectionSubtitle}>
                  Track your strength gains over time
                </Text>

                {topExercises.slice(0, 3).map((exerciseName) => {
                  const exerciseData = progressionData.get(exerciseName) || [];
                  if (exerciseData.length < 3) return null;

                  return (
                    <View key={exerciseName} style={styles.chartCard}>
                      <WeightProgressionChart
                        data={exerciseData}
                        exerciseName={exerciseName
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                        width={350}
                        height={200}
                      />
                    </View>
                  );
                })}
              </View>
            )}
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
    sectionSubtitle: {
      fontSize: 14,
      fontWeight: '400',
      color: colors.textSecondary,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 12,
    },
  });
