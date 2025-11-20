/**
 * Weight Progression Chart
 * Shows weight progression for exercises over time with a line chart
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

export interface ExerciseProgressionPoint {
  date: string; // ISO date
  exerciseName: string;
  weight: number; // Maximum weight lifted that day
  volume: number; // Total volume for context
}

interface WeightProgressionChartProps {
  data: ExerciseProgressionPoint[];
  exerciseName: string;
  width?: number;
  height?: number;
}

const CHART_PADDING = {
  top: 20,
  right: 16,
  bottom: 30,
  left: 40,
};

export const WeightProgressionChart: React.FC<WeightProgressionChartProps> = ({
  data,
  exerciseName,
  width = 350,
  height = 180,
}) => {
  const { colors } = useTheme();

  const chartWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

  // Calculate chart dimensions and points
  const { points, minWeight, maxWeight, yAxisLabels } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], minWeight: 0, maxWeight: 0, yAxisLabels: [] };
    }

    // Find min and max weights
    const weights = data.map((d) => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);

    // Add 10% padding to y-axis
    const padding = (max - min) * 0.1 || 10;
    const minY = Math.max(0, min - padding);
    const maxY = max + padding;

    // Generate Y-axis labels
    const yLabels = [
      Math.round(maxY),
      Math.round((maxY + minY) / 2),
      Math.round(minY),
    ];

    // Calculate point positions
    const chartPoints = data.map((d, i) => {
      const x =
        data.length === 1
          ? CHART_PADDING.left + chartWidth / 2
          : CHART_PADDING.left + (i / (data.length - 1)) * chartWidth;

      const yRatio = (d.weight - minY) / (maxY - minY || 1);
      const y = CHART_PADDING.top + chartHeight - yRatio * chartHeight;

      return { x, y, weight: d.weight, date: d.date };
    });

    return {
      points: chartPoints,
      minWeight: minY,
      maxWeight: maxY,
      yAxisLabels: yLabels,
    };
  }, [data, chartWidth, chartHeight]);

  // Generate path for line chart
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }, [points]);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No progression data
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Log workouts to see weight progression
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {exerciseName}
      </Text>

      <Svg width={width} height={height}>
        {/* Y-axis labels */}
        {yAxisLabels.map((label, i) => {
          const y =
            CHART_PADDING.top + (i * chartHeight) / (yAxisLabels.length - 1);
          return (
            <React.Fragment key={i}>
              <Line
                x1={CHART_PADDING.left - 5}
                y1={y}
                x2={CHART_PADDING.left}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
              />
              <Text
                x={CHART_PADDING.left - 10}
                y={y}
                fill={colors.textSecondary}
                fontSize={10}
                textAnchor="end"
                alignmentBaseline="middle"
              >
                {label}
              </Text>
            </React.Fragment>
          );
        })}

        {/* Grid lines */}
        {yAxisLabels.map((_, i) => {
          const y =
            CHART_PADDING.top + (i * chartHeight) / (yAxisLabels.length - 1);
          return (
            <Line
              key={`grid-${i}`}
              x1={CHART_PADDING.left}
              y1={y}
              x2={width - CHART_PADDING.right}
              y2={y}
              stroke={colors.border}
              strokeWidth={0.5}
              opacity={0.3}
            />
          );
        })}

        {/* X-axis */}
        <Line
          x1={CHART_PADDING.left}
          y1={CHART_PADDING.top + chartHeight}
          x2={width - CHART_PADDING.right}
          y2={CHART_PADDING.top + chartHeight}
          stroke={colors.border}
          strokeWidth={1}
        />

        {/* Y-axis */}
        <Line
          x1={CHART_PADDING.left}
          y1={CHART_PADDING.top}
          x2={CHART_PADDING.left}
          y2={CHART_PADDING.top + chartHeight}
          stroke={colors.border}
          strokeWidth={1}
        />

        {/* Line chart */}
        {linePath && (
          <Path
            d={linePath}
            stroke={colors.accent}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={colors.accent}
            stroke={colors.background}
            strokeWidth={2}
          />
        ))}

        {/* X-axis date labels (first, middle, last) */}
        {data.length > 0 && (
          <>
            {/* First date */}
            <Text
              x={points[0].x}
              y={CHART_PADDING.top + chartHeight + 20}
              fill={colors.textSecondary}
              fontSize={10}
              textAnchor="start"
            >
              {new Date(data[0].date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>

            {/* Last date */}
            {data.length > 1 && (
              <Text
                x={points[points.length - 1].x}
                y={CHART_PADDING.top + chartHeight + 20}
                fill={colors.textSecondary}
                fontSize={10}
                textAnchor="end"
              >
                {new Date(data[data.length - 1].date).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                  }
                )}
              </Text>
            )}
          </>
        )}
      </Svg>

      {/* Stats summary */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Current
          </Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {data[data.length - 1].weight} lbs
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Best
          </Text>
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {Math.max(...data.map((d) => d.weight))} lbs
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Progress
          </Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  data[data.length - 1].weight - data[0].weight >= 0
                    ? colors.success
                    : colors.error,
              },
            ]}
          >
            {data[data.length - 1].weight - data[0].weight >= 0 ? '+' : ''}
            {(data[data.length - 1].weight - data[0].weight).toFixed(1)} lbs
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
