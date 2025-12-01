/**
 * Macro Stacked Bar Chart
 * Shows daily macros (protein, carbs, fats) as stacked bars
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { DailyDataPoint, AggregatedDataPoint } from '../../hooks/useAnalyticsCharts';

type ChartDataPoint = DailyDataPoint | AggregatedDataPoint;

interface MacroStackedBarChartProps {
  data: ChartDataPoint[];
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  height?: number;
}

const CHART_PADDING = { top: 20, right: 8, bottom: 40, left: 8 };
const BAR_WIDTH = 24;
const BAR_GAP = 8;

export const MacroStackedBarChart: React.FC<MacroStackedBarChartProps> = ({
  data,
  avgProtein,
  avgCarbs,
  avgFat,
  height = 200,
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width - 40;

  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          No macro data available
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Start logging food to track your macros
        </Text>
      </View>
    );
  }

  // Filter to only days with food data
  const daysWithFood = data.filter((d) => {
    // For aggregated data, check daysWithFood > 0
    if ('daysWithFood' in d) {
      return d.daysWithFood > 0;
    }
    // For daily data, check hasFood
    return d.hasFood;
  });

  if (daysWithFood.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          No food logged in this period
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Log meals to see your macro breakdown
        </Text>
      </View>
    );
  }

  if (daysWithFood.length < 2) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          Not enough data for chart
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Log food for at least 2 days to see macro trends
        </Text>
      </View>
    );
  }

  const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;
  const totalWidth = daysWithFood.length * (BAR_WIDTH + BAR_GAP) + CHART_PADDING.left + CHART_PADDING.right;

  // Find max total macros for scaling
  const maxTotalGrams = Math.max(
    ...daysWithFood.map((d) => d.protein + d.carbs + d.fat),
    100 // Minimum scale
  );

  // Format date for x-axis
  const formatDate = (point: ChartDataPoint) => {
    // Use label if available (for aggregated data)
    if ('label' in point) {
      return point.label;
    }
    const date = new Date(point.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get today's macros
  const today = daysWithFood[daysWithFood.length - 1];
  const todayProtein = today?.protein || 0;
  const todayCarbs = today?.carbs || 0;
  const todayFat = today?.fat || 0;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.surface }]}>
      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryHeader}>
            <View style={[styles.colorDot, { backgroundColor: colors.blue }]} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Protein</Text>
          </View>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {todayProtein}g <Text style={styles.summaryAvg}>({avgProtein}g avg)</Text>
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <View style={styles.summaryHeader}>
            <View style={[styles.colorDot, { backgroundColor: colors.orange }]} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Carbs</Text>
          </View>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {todayCarbs}g <Text style={styles.summaryAvg}>({avgCarbs}g avg)</Text>
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <View style={styles.summaryHeader}>
            <View style={[styles.colorDot, { backgroundColor: colors.green }]} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Fats</Text>
          </View>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {todayFat}g <Text style={styles.summaryAvg}>({avgFat}g avg)</Text>
          </Text>
        </View>
      </View>

      {/* Chart and Labels */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <View>
          {/* Bars */}
          <Svg width={totalWidth} height={height}>
            {daysWithFood.map((day, i) => {
              const x = CHART_PADDING.left + i * (BAR_WIDTH + BAR_GAP);
              const totalGrams = day.protein + day.carbs + day.fat;

              // Calculate heights for each macro section
              const proteinHeight = (day.protein / maxTotalGrams) * chartHeight;
              const carbsHeight = (day.carbs / maxTotalGrams) * chartHeight;
              const fatHeight = (day.fat / maxTotalGrams) * chartHeight;

              // Y positions (stack from bottom to top: protein, carbs, fat)
              const proteinY = CHART_PADDING.top + chartHeight - proteinHeight;
              const carbsY = proteinY - carbsHeight;
              const fatY = carbsY - fatHeight;

              return (
                <React.Fragment key={i}>
                  {/* Protein (bottom) */}
                  {day.protein > 0 && (
                    <Rect
                      x={x}
                      y={proteinY}
                      width={BAR_WIDTH}
                      height={proteinHeight}
                      fill={colors.blue}
                      rx={i === 0 ? 0 : 4}
                    />
                  )}

                  {/* Carbs (middle) */}
                  {day.carbs > 0 && (
                    <Rect
                      x={x}
                      y={carbsY}
                      width={BAR_WIDTH}
                      height={carbsHeight}
                      fill={colors.orange}
                    />
                  )}

                  {/* Fat (top) */}
                  {day.fat > 0 && (
                    <Rect
                      x={x}
                      y={fatY}
                      width={BAR_WIDTH}
                      height={fatHeight}
                      fill={colors.green}
                      rx={4}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Svg>

          {/* X-axis labels aligned with bars */}
          <View style={[styles.xAxisLabels, { width: totalWidth }]}>
            {daysWithFood.map((day, i) => {
              // Only show label every N bars to avoid crowding
              const shouldShowLabel = i % Math.max(1, Math.ceil(daysWithFood.length / 5)) === 0;
              if (!shouldShowLabel) return null;

              // Align label with left edge of bar for rotated text
              const barX = CHART_PADDING.left + i * (BAR_WIDTH + BAR_GAP);

              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    left: barX - 10,
                    top: 0,
                    transform: [{ rotate: '-45deg' }],
                  }}
                >
                  <Text
                    style={[
                      styles.xAxisLabel,
                      { color: colors.textTertiary }
                    ]}
                  >
                    {formatDate(day)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    padding: 16,
  },
  container: {
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: 0, // Prevent flex items from overflowing
    marginHorizontal: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryAvg: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.6,
  },
  xAxisLabels: {
    marginTop: -16,
    height: 25,
    position: 'relative',
  },
  xAxisLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'left',
  },
});
