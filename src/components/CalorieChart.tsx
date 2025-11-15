import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G } from "react-native-svg";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface CalorieChartProps {
  data: ChartDataPoint[];
}

export default function CalorieChart({ data }: CalorieChartProps) {
  const width = 340;    // chart width
  const height = 140;   // chart height
  const padding = 20;

  const maxValue = Math.max(...data.map((d: ChartDataPoint) => d.value));
  const minValue = 0;

  const scaleX = (i: number) =>
    padding + (i / (data.length - 1)) * (width - padding * 2);

  const scaleY = (v: number) =>
    height - padding - ((v - minValue) / (maxValue - minValue)) * (height - padding * 2);

  // Build smooth "monotone" path
  const buildSmoothPath = () => {
    let d = "";

    data.forEach((point: ChartDataPoint, i: number) => {
      const x = scaleX(i);
      const y = scaleY(point.value);

      if (i === 0) {
        d += `M ${x},${y}`;
      } else {
        const prevX = scaleX(i - 1);
        const prevY = scaleY(data[i - 1].value);
        const midX = (prevX + x) / 2;

        d += ` C ${midX},${prevY} ${midX},${y} ${x},${y}`;
      }
    });

    return d;
  };

  return (
    <View style={styles.wrapper}>
      <Svg width={width} height={height}>
        <G>
          {/* Smooth line path */}
          <Path
            d={buildSmoothPath()}
            stroke="black"
            strokeWidth={2}
            fill="none"
          />
        </G>
      </Svg>

      {/* X-axis labels */}
      <View style={styles.labels}>
        {data.map((point: ChartDataPoint, i: number) => (
          <Text key={i} style={styles.label}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  labels: {
    width: 340,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    fontSize: 12,
    color: "#999",
  },
});
