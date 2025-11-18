import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Line, G, Text as SvgText } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

interface ChartDataPoint {
  label: string;
  value: number;
  foodName?: string;
  calories?: number;
}

interface CalorieChartProps {
  data: ChartDataPoint[];
}

export default function CalorieChart({ data }: CalorieChartProps) {
  const { colors } = useTheme();
  const width = 340;
  const height = 200;
  const padding = 40;
  const topPadding = 60;

  if (data.length === 0) {
    return (
      <View style={styles.wrapper}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No data to display</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d: ChartDataPoint) => d.value), 100);
  const minValue = 0;

  const scaleX = (i: number) => {
    if (data.length === 1) return width / 2;
    return padding + (i / (data.length - 1)) * (width - padding * 2);
  };

  const scaleY = (v: number) =>
    height - padding - ((v - minValue) / (maxValue - minValue)) * (height - padding - topPadding);

  const maxCaloriesIndex = data.reduce((maxIdx, point, idx, arr) => {
    return (point.calories || 0) > (arr[maxIdx].calories || 0) ? idx : maxIdx;
  }, 0);

  return (
    <View style={styles.wrapper}>
      <Svg width={width} height={height}>
        <G>
          {/* Draw lines */}
          {data.map((point, i) => {
            if (i === 0) return null;
            const x1 = scaleX(i - 1);
            const y1 = scaleY(data[i - 1].value);
            const x2 = scaleX(i);
            const y2 = scaleY(point.value);
            const isMaxSegment = i === maxCaloriesIndex && point.calories;

            return (
              <Line
                key={`line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMaxSegment ? colors.error : colors.chartLine}
                strokeWidth={isMaxSegment ? 2.5 : 2}
              />
            );
          })}

          {/* Draw annotations */}
          {data.map((point, i) => {
            const x = scaleX(i);
            const y = scaleY(point.value);
            const isMaxPoint = i === maxCaloriesIndex && point.calories;

            if (!point.foodName || !point.calories) return null;

            return (
              <G key={`annotation-${i}`}>
                <Line
                  x1={x}
                  y1={y - 4}
                  x2={x}
                  y2={topPadding - 5}
                  stroke={isMaxPoint ? colors.error : colors.textSecondary}
                  strokeWidth={1.5}
                />
                <Line
                  x1={x}
                  y1={y - 4}
                  x2={x - 3}
                  y2={y - 10}
                  stroke={isMaxPoint ? colors.error : colors.textSecondary}
                  strokeWidth={1.5}
                />
                <Line
                  x1={x}
                  y1={y - 4}
                  x2={x + 3}
                  y2={y - 10}
                  stroke={isMaxPoint ? colors.error : colors.textSecondary}
                  strokeWidth={1.5}
                />

                <SvgText
                  x={x}
                  y={topPadding - 15}
                  fontSize="10"
                  fill={isMaxPoint ? colors.error : colors.textPrimary}
                  fontWeight={isMaxPoint ? "600" : "400"}
                  textAnchor="middle"
                >
                  {point.foodName}
                </SvgText>
                <SvgText
                  x={x}
                  y={topPadding - 5}
                  fontSize="9"
                  fill={isMaxPoint ? colors.error : colors.textSecondary}
                  textAnchor="middle"
                >
                  {point.calories} cal
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>

      <View style={styles.labels}>
        {data.map((point: ChartDataPoint, i: number) => (
          <Text key={i} style={[styles.label, { color: colors.textSecondary }]}>
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
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
