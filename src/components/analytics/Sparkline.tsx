/**
 * Sparkline Component
 * Minimal line chart for displaying trends
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width,
  height,
  strokeColor,
  strokeWidth = 1.5,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate min and max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  // Add padding to top and bottom
  const padding = height * 0.15;

  // Generate points for the polyline
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - padding - ((value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};
