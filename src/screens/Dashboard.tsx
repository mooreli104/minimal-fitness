/**
 * Dashboard Screen
 * Main dashboard with streaks, water tracker, and to-do list
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemeColors, Theme } from '../context/ThemeContext';
import { useDashboardStreaks } from '../hooks/useDashboardStreaks';
import { useWaterIntake } from '../hooks/useWaterIntake';
import { useTodoList } from '../hooks/useTodoList';
import { useAnalyticsCharts } from '../hooks/useAnalyticsCharts';
import { StreakCard } from '../components/dashboard/StreakCard';
import { WaterTracker } from '../components/dashboard/WaterTracker';
import { TodoChecklist } from '../components/dashboard/TodoChecklist';
import { QuickStats } from '../components/dashboard/QuickStats';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
  const { colors, theme } = useTheme();
  const styles = getStyles(colors, theme);

  // Load streak data
  const {
    workoutStreak,
    foodStreak,
    isLoading: streaksLoading,
    refresh: refreshStreaks,
  } = useDashboardStreaks();

  // Load water intake
  const {
    glasses,
    goal,
    increment: incrementWater,
    decrement: decrementWater,
    isLoading: waterLoading,
  } = useWaterIntake();

  // Load todo list
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    isLoading: todosLoading,
  } = useTodoList();

  // Load analytics data for Quick Stats (week view)
  const {
    dailyData,
    workoutsCount,
    totalVolume,
    currentStreak,
    timeRange,
    isLoading: analyticsLoading,
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

  const isLoading = streaksLoading || waterLoading || todosLoading || analyticsLoading;
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStreaks();
    setRefreshing(false);
  };

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Track your daily progress</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            {/* Streak Cards */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Your Streaks</Text>
              <View style={styles.streaksGrid}>
                <StreakCard type="workout" streak={workoutStreak} />
                <StreakCard type="food" streak={foodStreak} />
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Quick Stats</Text>
              <QuickStats
                totalVolume={totalVolume}
                volumeChange={volumeChange}
                dailyData={dailyData}
              />
            </View>

            {/* Water Tracker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Hydration</Text>
              <WaterTracker
                glasses={glasses}
                goal={goal}
                onIncrement={incrementWater}
                onDecrement={decrementWater}
              />
            </View>

            {/* Todo Checklist */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tasks</Text>
              <TodoChecklist
                todos={todos}
                onAdd={addTodo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, theme: Theme) =>
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
      gap: 24,
    },
    header: {
      marginBottom: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '400',
      color: colors.textSecondary,
    },
    loadingContainer: {
      marginTop: 60,
      alignItems: 'center',
    },
    section: {
      gap: 12,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: 4,
    },
    streaksGrid: {
      flexDirection: 'row',
      gap: 12,
    },
  });
