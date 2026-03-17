import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';
import BottomNav from '../components/BottomNav';
import { getAllWorkoutLogs } from '../services/workoutStorage.service';
import { parseWeight } from '../utils/parseWeight';
import { BackgroundPattern } from '../components/common/BackgroundPattern';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface WeightDataPoint {
  value: number;
  label: string;
}

interface WeekCount {
  value: number;
  label: string;
}

export default function Stats() {
  const { colors } = useTheme();

  const [allExerciseNames, setAllExerciseNames] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([]);
  const [frequencyData, setFrequencyData] = useState<WeekCount[]>([]);
  const [loading, setLoading] = useState(true);

  const logsCache = React.useRef<Array<{ date: string; log: any }>>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const logs = await getAllWorkoutLogs();
    logsCache.current = logs;

    // Frequency chart: workouts per week for last 12 weeks
    // Seed last 12 weeks with 0, anchored to current week's Monday
    const weekMap = new Map<string, number>();
    const getMonday = (d: Date): Date => {
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diff);
      return monday;
    };
    const now = new Date();
    const thisMonday = getMonday(now);
    for (let i = 11; i >= 0; i--) {
      const monday = new Date(thisMonday);
      monday.setDate(thisMonday.getDate() - i * 7);
      const label = `${String(monday.getMonth()+1).padStart(2,'0')}/${String(monday.getDate()).padStart(2,'0')}`;
      weekMap.set(label, 0);
    }
    for (const { date } of logs) {
      const [y, m, d] = date.split('-').map(Number);
      const logDate = new Date(y, m - 1, d);
      const monday = getMonday(logDate);
      const label = `${String(monday.getMonth()+1).padStart(2,'0')}/${String(monday.getDate()).padStart(2,'0')}`;
      if (weekMap.has(label)) {
        weekMap.set(label, (weekMap.get(label) ?? 0) + 1);
      }
    }
    const freqArr: WeekCount[] = Array.from(weekMap.entries()).map(([label, value]) => ({ label, value }));
    setFrequencyData(freqArr);

    // Collect all unique exercise names
    const nameSet = new Set<string>();
    for (const { log } of logs) {
      for (const ex of log.exercises ?? []) {
        if (ex.name?.trim()) nameSet.add(ex.name.trim());
      }
    }
    const names = Array.from(nameSet).sort();
    setAllExerciseNames(names);
    if (names.length > 0) setSelectedExercise(prev => prev || names[0]);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedExercise) return;
    const logs = logsCache.current;
    const points: WeightDataPoint[] = [];
    for (const { date, log } of [...logs].reverse()) {
      const match = log.exercises?.find(
        (ex: any) => ex.name.trim().toLowerCase() === selectedExercise.toLowerCase() && ex.weight
      );
      if (match) {
        const val = parseWeight(match.weight);
        if (val !== null) {
          const [, m, d] = date.split('-');
          points.push({ value: val, label: `${m}/${d}` });
        }
      }
    }
    setWeightData(points);
  }, [selectedExercise]);

  const chartWidth = SCREEN_WIDTH - 48;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={[s.pageTitle, { color: colors.textPrimary }]}>Stats</Text>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 60 }} color={colors.accent} />
          ) : (
            <>
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Weight Progression</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.pickerRow}
              >
                {allExerciseNames.map(name => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => setSelectedExercise(name)}
                    style={[
                      s.pill,
                      {
                        backgroundColor: name === selectedExercise ? colors.blue : colors.surfaceAlt,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.pillText,
                        { color: name === selectedExercise ? '#FFFFFF' : colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {weightData.length < 2 ? (
                <Text style={[s.empty, { color: colors.textSecondary }]}>
                  {weightData.length === 0
                    ? 'No weight data logged for this exercise.'
                    : 'Need at least 2 sessions with weight to show a chart.'}
                </Text>
              ) : (
                <View style={[s.chartCard, { backgroundColor: colors.surface }]}>
                  <LineChart
                    data={weightData}
                    width={chartWidth - 32}
                    height={180}
                    color={colors.blue}
                    thickness={2}
                    dataPointsColor={colors.blue}
                    xAxisColor={colors.border}
                    yAxisColor={colors.border}
                    xAxisLabelTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
                    yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
                    hideDataPoints={weightData.length > 20}
                    curved
                    areaChart
                    startFillColor={colors.blue}
                    endFillColor="transparent"
                    startOpacity={0.15}
                    endOpacity={0}
                    backgroundColor={colors.surface}
                    rulesColor={colors.border}
                    rulesType="solid"
                    noOfSections={4}
                  />
                </View>
              )}

              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Workout Frequency</Text>
              <Text style={[s.sectionSub, { color: colors.textSecondary }]}>Workouts per week (last 12 weeks)</Text>

              {frequencyData.every(d => d.value === 0) ? (
                <Text style={[s.empty, { color: colors.textSecondary }]}>No workouts logged yet.</Text>
              ) : (
                <View style={[s.chartCard, { backgroundColor: colors.surface }]}>
                  <BarChart
                    data={frequencyData}
                    width={chartWidth - 32}
                    height={160}
                    barWidth={Math.floor((chartWidth - 80) / frequencyData.length)}
                    barBorderRadius={4}
                    frontColor={colors.blue}
                    xAxisColor={colors.border}
                    yAxisColor={colors.border}
                    xAxisLabelTextStyle={{ color: colors.textTertiary, fontSize: 9 }}
                    yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
                    noOfSections={4}
                    backgroundColor={colors.surface}
                    rulesColor={colors.border}
                    hideRules={false}
                    maxValue={7}
                    stepValue={1}
                  />
                </View>
              )}

              <View style={{ height: 100 }} />
            </>
          )}
        </ScrollView>
        <BottomNav />
      </View>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 60 },
  pageTitle: { fontSize: 28, fontWeight: '700', marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 28, marginBottom: 8 },
  sectionSub: { fontSize: 13, marginBottom: 12 },
  pickerRow: { flexDirection: 'row', gap: 8, paddingBottom: 12 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 160,
  },
  pillText: { fontSize: 13, fontWeight: '500' },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  empty: { textAlign: 'center', paddingVertical: 24, fontSize: 14 },
});
