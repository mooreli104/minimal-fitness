/**
 * Body Weight Chart
 * Line chart showing body weight progression over time with interactive tooltips
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { WeightEntry } from '../../services/weightTracking.service';

interface BodyWeightChartProps {
  data: WeightEntry[];
  height?: number;
}

const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 40 };
const CONTAINER_PADDING = 12; // Container has padding: 12

export const BodyWeightChart: React.FC<BodyWeightChartProps> = ({
  data,
  height = 220,
}) => {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const screenWidth = Dimensions.get('window').width - 40; // Account for screen padding

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height, backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          No weight data available
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Start logging your weight to see your progress
        </Text>
      </View>
    );
  }

  if (data.length < 2) {
    return (
      <View style={[styles.container, { height, backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          Not enough data for chart
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Log weight for at least 2 days to see trends
        </Text>
      </View>
    );
  }

  // Sort data by date (oldest to newest)
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);

  // Calculate width accounting for container padding (12px on each side)
  const width = screenWidth - (CONTAINER_PADDING * 2);
  const chartWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

  // Calculate data bounds with padding for better visualization
  const weights = sortedData.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight;

  // Add 10% padding to top and bottom, with minimum range of 5 lbs for better visualization
  const effectiveRange = Math.max(weightRange, 5);
  const minY = Math.max(0, minWeight - effectiveRange * 0.1); // Don't go below 0
  const maxY = maxWeight + effectiveRange * 0.1;

  // Calculate points
  const points = sortedData.map((d, i) => {
    const xPosition = sortedData.length === 1
      ? CHART_PADDING.left + chartWidth / 2
      : CHART_PADDING.left + (i / (sortedData.length - 1)) * chartWidth;
    const y =
      CHART_PADDING.top +
      chartHeight -
      ((d.weight - minY) / (maxY - minY || 1)) * chartHeight;
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

  // Format date and time for tooltip
  const formatDateTime = (entry: WeightEntry) => {
    // Parse date string as local date (YYYY-MM-DD) to avoid timezone issues
    const [year, month, day] = entry.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { date: dateStr, time };
  };

  // Y-axis labels (show 4 ticks)
  const yTicks = [0, 1, 2, 3].map((i) => {
    const value = minY + (i / 3) * (maxY - minY);
    return {
      value: Math.round(value * 10) / 10, // Round to 1 decimal
      y: CHART_PADDING.top + chartHeight - (i / 3) * chartHeight,
    };
  });

  // Calculate weight change
  const weightChange = sortedData[sortedData.length - 1].weight - sortedData[0].weight;
  const weightChangePercent = ((weightChange / sortedData[0].weight) * 100).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Tooltip */}
      {activeIndex !== null && sortedData[activeIndex] && (() => {
        const { date, time } = formatDateTime(sortedData[activeIndex]);
        return (
          <View style={[styles.tooltip, { backgroundColor: colors.accent }]}>
            <Text style={[styles.tooltipDate, { color: colors.background }]}>
              {date}
            </Text>
            <Text style={[styles.tooltipValue, { color: colors.background }]}>
              {sortedData[activeIndex].weight} lbs
            </Text>
            <Text style={[styles.tooltipTime, { color: colors.background }]}>
              {time}
            </Text>
          </View>
        );
      })()}

      {/* Stats Badge - Only show if there's actual weight change */}
      {sortedData.length >= 2 && Math.abs(weightChange) > 0.1 && (
        <View style={[styles.statsBadge, { backgroundColor: `${colors.accent}15` }]}>
          <Text style={[styles.statsText, { color: colors.textPrimary }]}>
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
          </Text>
          <Text style={[styles.statsSubtext, { color: colors.textSecondary }]}>
            ({weightChange > 0 ? '+' : ''}{weightChangePercent}%)
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
            {tick.value}
          </SvgText>
        ))}

        {/* Area fill */}
        {areaPath && <Path d={areaPath} fill={`${colors.green}20`} />}

        {/* Line */}
        {linePath && <Path d={linePath} stroke={colors.green} strokeWidth="2.5" fill="none" />}

        {/* Data points */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={activeIndex === i ? 6 : 3}
            fill={activeIndex === i ? colors.green : colors.background}
            stroke={colors.green}
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
    marginBottom: 2,
  },
  tooltipTime: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.9,
  },
  statsBadge: {
    position: 'absolute',
    top: 16,
    left: 52, // Position after y-axis labels (CHART_PADDING.left + margin)
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsSubtext: {
    fontSize: 11,
    fontWeight: '500',
  },
});
