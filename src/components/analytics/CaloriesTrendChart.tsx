/**
 * Calories Trend Chart
 * Line/area chart showing calories over time with interactive tooltips
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { DailyDataPoint, AggregatedDataPoint } from '../../hooks/useAnalyticsCharts';

type ChartDataPoint = DailyDataPoint | AggregatedDataPoint;

interface CaloriesTrendChartProps {
  data: ChartDataPoint[];
  height?: number;
}

const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 40 };

export const CaloriesTrendChart: React.FC<CaloriesTrendChartProps> = ({
  data,
  height = 220,
}) => {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const screenWidth = Dimensions.get('window').width - 40; // Account for screen padding

  // Check if we have enough data for a meaningful chart
  const daysWithCalories = data.filter((d) => d.calories > 0);

  if (data.length === 0 || daysWithCalories.length === 0) {
    return (
      <View style={[styles.container, { height, backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          No calorie data available
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Start logging food to see your calorie trends
        </Text>
      </View>
    );
  }

  if (daysWithCalories.length < 2) {
    return (
      <View style={[styles.container, { height, backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          Not enough data for chart
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Log food for at least 2 days to see trends
        </Text>
      </View>
    );
  }

  const width = screenWidth;
  const chartWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

  // Calculate data bounds
  const calorieValues = data.map((d) => d.calories);
  const maxCalories = Math.max(...calorieValues, 2000); // Minimum scale of 2000
  const minCalories = 0;

  // Calculate points
  const points = data.map((d, i) => {
    const xPosition = data.length === 1
      ? CHART_PADDING.left + chartWidth / 2
      : CHART_PADDING.left + (i / (data.length - 1)) * chartWidth;
    const y =
      CHART_PADDING.top +
      chartHeight -
      ((d.calories - minCalories) / (maxCalories - minCalories || 1)) * chartHeight;
    return { x: xPosition, y, data: d };
  });

  // Create SVG path for line
  const linePath = points.reduce((path, point, i) => {
    const command = i === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x},${point.y}`;
  }, '');

  // Create area path (fill under line)
  const areaPath = points.length > 0
    ? linePath +
      ` L ${points[points.length - 1].x},${CHART_PADDING.top + chartHeight}` +
      ` L ${CHART_PADDING.left},${CHART_PADDING.top + chartHeight} Z`
    : '';

  // Format date for tooltip
  const formatDate = (point: ChartDataPoint) => {
    // Use label if available (for aggregated data), otherwise format date
    if ('label' in point) {
      return point.label;
    }
    const date = new Date(point.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Y-axis labels (show 4 ticks)
  const yTicks = [0, maxCalories / 3, (maxCalories * 2) / 3, maxCalories].map((value) => ({
    value: Math.round(value),
    y: CHART_PADDING.top + chartHeight - (value / maxCalories) * chartHeight,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Tooltip */}
      {activeIndex !== null && data[activeIndex] && (
        <View style={[styles.tooltip, { backgroundColor: colors.accent }]}>
          <Text style={[styles.tooltipDate, { color: colors.background }]}>
            {formatDate(data[activeIndex])}
          </Text>
          <Text style={[styles.tooltipValue, { color: colors.background }]}>
            {data[activeIndex].calories.toLocaleString()} cal
            {'daysWithFood' in data[activeIndex] && data[activeIndex].daysWithFood > 0 && (
              <Text style={{ fontSize: 11, opacity: 0.8 }}>
                {' '}avg
              </Text>
            )}
          </Text>
        </View>
      )}

      <Svg width={width} height={height}>
        {/* Y-axis grid lines */}
        {yTicks.map((tick, i) => (
          <Line
            key={i}
            x1={CHART_PADDING.left}
            y1={tick.y}
            x2={width - CHART_PADDING.right}
            y2={tick.y}
            stroke={colors.border}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <SvgText
            key={i}
            x={CHART_PADDING.left - 8}
            y={tick.y + 4}
            fill={colors.textTertiary}
            fontSize="10"
            textAnchor="end"
          >
            {tick.value >= 1000 ? `${(tick.value / 1000).toFixed(1)}k` : tick.value}
          </SvgText>
        ))}

        {/* Area fill */}
        {areaPath && <Path d={areaPath} fill={`${colors.blue}20`} />}

        {/* Line */}
        {linePath && <Path d={linePath} stroke={colors.blue} strokeWidth="2" fill="none" />}

        {/* Data points */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={activeIndex === i ? 6 : 3}
            fill={activeIndex === i ? colors.blue : colors.background}
            stroke={colors.blue}
            strokeWidth="2"
            onPress={() => setActiveIndex(i === activeIndex ? null : i)}
          />
        ))}

        {/* Invisible touch areas for better interaction */}
        {points.map((point, i) => (
          <Rect
            key={`touch-${i}`}
            x={point.x - 15}
            y={0}
            width={30}
            height={height}
            fill="transparent"
            onPress={() => setActiveIndex(i === activeIndex ? null : i)}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 70,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  tooltip: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  tooltipDate: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
