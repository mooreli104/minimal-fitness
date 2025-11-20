/**
 * Streak Sparkline
 * Mini bar chart showing daily activity streak (last 7-30 days)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { DailyDataPoint } from '../../hooks/useAnalyticsCharts';

interface StreakSparklineProps {
  data: DailyDataPoint[];
  currentStreak: number;
  width?: number;
  height?: number;
}

export const StreakSparkline: React.FC<StreakSparklineProps> = ({
  data,
  currentStreak,
  width = 120,
  height = 40,
}) => {
  const { colors } = useTheme();

  if (data.length === 0) {
    return null;
  }

  // Take last 14 days for sparkline
  const recentData = data.slice(-14);
  const barWidth = (width - (recentData.length - 1) * 2) / recentData.length;
  const maxHeight = height - 4;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {recentData.map((day, i) => {
          const isActive = day.hasWorkout || day.hasFood;
          const isToday = i === recentData.length - 1;
          const barHeight = isActive ? maxHeight : maxHeight * 0.2;
          const x = i * (barWidth + 2);
          const y = height - barHeight;

          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={isActive ? (isToday ? colors.accent : colors.green) : `${colors.border}80`}
              rx={2}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
});
