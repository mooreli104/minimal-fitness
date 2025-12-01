/**
 * Nutrition Charts Component
 * Swipeable component combining Calorie Intake and Macronutrient charts
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TimeRangeSelector } from './TimeRangeSelector';
import { CaloriesTrendChart } from './CaloriesTrendChart';
import { MacroStackedBarChart } from './MacroStackedBarChart';
import type { TimeRange, AggregatedDataPoint } from '../../hooks/useAnalyticsCharts';

interface NutritionChartsProps {
  timeRange: TimeRange;
  onChangeTimeRange: (range: TimeRange) => void;
  aggregatedData: AggregatedDataPoint[];
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
}

export const NutritionCharts: React.FC<NutritionChartsProps> = ({
  timeRange,
  onChangeTimeRange,
  aggregatedData,
  avgProtein,
  avgCarbs,
  avgFat,
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate page width to match viewport exactly
  // Account for Analytics screen padding (20px on each side)
  const pageWidth = width - 40;

  // Memoize scroll handler to prevent recreation
  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / pageWidth);
    setCurrentPage(page);
  }, [pageWidth]);

  // Memoize scroll function to prevent recreation
  const scrollToPage = useCallback((page: number) => {
    scrollViewRef.current?.scrollTo({
      x: page * pageWidth,
      animated: true,
    });
    setCurrentPage(page);
  }, [pageWidth]);

  // Memoize pages array to prevent recreating chart components on every render
  const pages = useMemo(() => [
    {
      title: 'Calorie Intake',
      component: <CaloriesTrendChart data={aggregatedData} height={220} key={`calories-${timeRange}`} />,
    },
    {
      title: 'Macronutrients',
      component: (
        <MacroStackedBarChart
          data={aggregatedData}
          avgProtein={avgProtein}
          avgCarbs={avgCarbs}
          avgFat={avgFat}
          height={220}
          key={`macros-${timeRange}`}
        />
      ),
    },
  ], [aggregatedData, avgProtein, avgCarbs, avgFat, timeRange]);

  return (
    <View style={styles.container}>
      {/* Chart Title with Page Indicator */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{pages[currentPage].title}</Text>

        {/* Page Dots */}
        <View style={styles.pageIndicator}>
          {pages.map((_, index) => (
            <TouchableOpacity key={index} onPress={() => scrollToPage(index)} activeOpacity={0.7}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      currentPage === index ? colors.accent : colors.border,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Swipeable Charts */}
      <View style={{ width: pageWidth, overflow: 'hidden' }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {pages.map((page, index) => (
            <View key={index} style={[styles.page, { width: pageWidth }]}>
              {page.component}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Time Range Selector - Moved below charts */}
      <View style={styles.timeRangeSelectorContainer}>
        <TimeRangeSelector selected={timeRange} onSelect={onChangeTimeRange} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  pageIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
  },
  timeRangeSelectorContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
});
