/**
 * Volume Sparkline
 * Mini line chart showing workout volume trend
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { DailyDataPoint } from '../../hooks/useAnalyticsCharts';

interface VolumeSparklineProps {
  data: DailyDataPoint[];
  width?: number;
  height?: number;
}

export const VolumeSparkline: React.FC<VolumeSparklineProps> = ({
  data,
  width = 120,
  height = 40,
}) => {
  const { colors } = useTheme();

  // Filter to only workout days
  const workoutDays = data.filter((d) => d.hasWorkout && d.volume > 0);

  // Need at least 2 workouts for a meaningful sparkline
  if (workoutDays.length < 2) {
    return null;
  }

  // Take last 10 workout days
  const recentWorkouts = workoutDays.slice(-10);
  const volumes = recentWorkouts.map((d) => d.volume);
  const maxVolume = Math.max(...volumes);
  const minVolume = Math.min(...volumes);
  const range = maxVolume - minVolume || 1;

  // Calculate points
  const points = recentWorkouts.map((_, i) => {
    const x = (i / (recentWorkouts.length - 1 || 1)) * width;
    const normalizedValue = (volumes[i] - minVolume) / range;
    const y = height - normalizedValue * height;
    return { x, y };
  });

  // Create path
  const linePath = points.reduce((path, point, i) => {
    const command = i === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x},${point.y}`;
  }, '');

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Line */}
        <Path d={linePath} stroke={colors.accent} strokeWidth="1.5" fill="none" />

        {/* Points */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={1.5}
            fill={colors.accent}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
});
