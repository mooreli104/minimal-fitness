/**
 * Analytics / Progress Screen
 * Displays interactive charts and metrics with time range selection
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { WorkoutDayFilter } from '../components/analytics/WorkoutDayFilter';
import { NutritionCharts } from '../components/analytics/NutritionCharts';
import { WeightProgressionChart } from '../components/analytics/WeightProgressionChart';
import { BodyWeightChart } from '../components/analytics/BodyWeightChart';
import { WorkoutHeatmap } from '../components/analytics/WorkoutHeatmap';
import { PersonalRecords } from '../components/analytics/PersonalRecords';
import BottomNav from '../components/BottomNav';
import { useAnalyticsCharts } from '../hooks/useAnalyticsCharts';
import { useWeightProgression } from '../hooks/useWeightProgression';
import { useBodyWeight } from '../hooks/useBodyWeight';
import { useWorkoutHeatmap } from '../hooks/useWorkoutHeatmap';
import { usePersonalRecords } from '../hooks/usePersonalRecords';

export default function Analytics() {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);
  const isFocused = useIsFocused();
  const [hasBodyWeightLoaded, setHasBodyWeightLoaded] = useState(false);

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
    allWorkoutDays,
    getExercisesByWorkoutDay,
    isLoading: isProgressionLoading,
  } = useWeightProgression(90);

  // Load body weight data
  const { weightEntries, refreshData: refreshBodyWeight } = useBodyWeight();

  // Load workout heatmap data
  const {
    heatmapData,
    totalWorkoutDays,
    currentStreak,
    longestStreak,
    isLoading: isHeatmapLoading,
  } = useWorkoutHeatmap(182); // 6 months

  // Load personal records
  const { personalRecords, isLoading: isPRsLoading } = usePersonalRecords(365);

  // Workout day filter state
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string | null>(null);

  // Get filtered exercises based on selected workout day
  const displayExercises = getExercisesByWorkoutDay(selectedWorkoutDay);

  // Mark body weight data as loaded after initial render
  useEffect(() => {
    if (weightEntries.length >= 0) {
      setHasBodyWeightLoaded(true);
    }
  }, [weightEntries]);

  // Reload body weight data when screen comes into focus (after initial load)
  useEffect(() => {
    if (isFocused && hasBodyWeightLoaded) {
      refreshBodyWeight();
    }
  }, [isFocused, hasBodyWeightLoaded, refreshBodyWeight]);

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

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            {/* Nutrition Charts (Swipeable) */}
            <NutritionCharts
              timeRange={timeRange}
              onChangeTimeRange={changeTimeRange}
              aggregatedData={aggregatedData}
              avgProtein={avgProtein}
              avgCarbs={avgCarbs}
              avgFat={avgFat}
            />

            {/* Personal Records Section */}
            {!isPRsLoading && personalRecords.size > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Records</Text>
                <Text style={styles.sectionSubtitle}>
                  Your strongest lifts by estimated 1RM
                </Text>
                <PersonalRecords records={personalRecords} topN={5} />
              </View>
            )}

            {/* Body Weight Chart */}
            {weightEntries.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Body Weight</Text>
                <Text style={styles.sectionSubtitle}>
                  Track your weight progression over time
                </Text>
                <View style={styles.chartCard}>
                  <BodyWeightChart data={weightEntries} height={220} />
                </View>
              </View>
            )}

            {/* Weight Progression Section */}
            {!isProgressionLoading && topExercises.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weight Progression</Text>
                <Text style={styles.sectionSubtitle}>
                  Track your strength gains over time
                </Text>

                {/* Workout Day Filter */}
                {allWorkoutDays.length > 0 && (
                  <WorkoutDayFilter
                    workoutDays={allWorkoutDays}
                    selected={selectedWorkoutDay}
                    onSelect={setSelectedWorkoutDay}
                  />
                )}

                {displayExercises.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: colors.textTertiary }]}>
                      No exercises found for {selectedWorkoutDay || 'this filter'}
                    </Text>
                  </View>
                ) : (
                  displayExercises.slice(0, 3).map((exerciseName) => {
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
                  })
                )}
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
    emptyState: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
  });
