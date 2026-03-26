import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';
import { WorkoutDay } from '../types';
import BottomNav from '../components/BottomNav';
import { getAllWorkoutLogs, deleteExerciseFromAllLogs } from '../services/workoutStorage.service';
import { parseWeight } from '../utils/parseWeight';
import { getStartOfWeekMonday } from '../utils/formatters';
import { BackgroundPattern } from '../components/common/BackgroundPattern';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([]);
  const [frequencyData, setFrequencyData] = useState<WeekCount[]>([]);
  const [loading, setLoading] = useState(true);

  const logsCache = React.useRef<Array<{ date: string; log: WorkoutDay }>>([]);
  const [logVersion, setLogVersion] = useState(0);
  const [exerciseSearch, setExerciseSearch] = useState('');

  const allExerciseNames = useMemo(() => {
    const nameSet = new Set<string>();
    for (const { log } of logsCache.current) {
      for (const ex of log.exercises ?? []) {
        if (ex.name?.trim()) nameSet.add(ex.name.trim());
      }
    }
    return Array.from(nameSet).sort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logVersion]);

  const filteredExerciseNames = useMemo(() => {
    if (!exerciseSearch.trim()) return allExerciseNames;
    const query = exerciseSearch.trim().toLowerCase();
    return allExerciseNames.filter(name => name.toLowerCase().includes(query));
  }, [allExerciseNames, exerciseSearch]);

  const handleDeleteExercise = useCallback((name: string) => {
    Alert.alert(
      'Delete Exercise',
      `Remove "${name}" from all workout logs? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExerciseFromAllLogs(name);
            if (selectedExercise === name) setSelectedExercise('');
            await loadData();
          },
        },
      ]
    );
  }, [selectedExercise]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const logs = await getAllWorkoutLogs();
    logsCache.current = logs;

    // Frequency chart: workouts per week for last 12 weeks
    // Seed last 12 weeks with 0, anchored to current week's Monday
    const toLabel = (d: Date) =>
      `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
    const weekMap = new Map<string, number>();
    const thisMonday = getStartOfWeekMonday(new Date());
    for (let i = 11; i >= 0; i--) {
      const monday = new Date(thisMonday);
      monday.setDate(thisMonday.getDate() - i * 7);
      weekMap.set(toLabel(monday), 0);
    }
    for (const { date } of logs) {
      const [y, m, d] = date.split('-').map(Number);
      const monday = getStartOfWeekMonday(new Date(y, m - 1, d));
      const label = toLabel(monday);
      if (weekMap.has(label)) {
        weekMap.set(label, (weekMap.get(label) ?? 0) + 1);
      }
    }
    const freqArr: WeekCount[] = Array.from(weekMap.entries()).map(([label, value]) => ({ label, value }));
    setFrequencyData(freqArr);

    setLogVersion(v => v + 1);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (allExerciseNames.length > 0) {
      setSelectedExercise(prev => prev || allExerciseNames[0]);
    }
  }, [allExerciseNames]);

  useEffect(() => {
    if (!selectedExercise) return;
    const logs = logsCache.current;
    const points: WeightDataPoint[] = [];
    for (const { date, log } of [...logs].reverse()) {
      const match = log.exercises?.find(
        (ex) => ex.name.trim().toLowerCase() === selectedExercise.toLowerCase() && ex.weight
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
    <GestureHandlerRootView style={s.flex}>
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <BackgroundPattern />
        <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
          <Text style={[s.pageTitle, { color: colors.textPrimary }]}>Stats</Text>

          {loading ? (
            <ActivityIndicator style={s.loadingIndicator} color={colors.accent} />
          ) : (
            <>
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Weight Progression</Text>

              {allExerciseNames.length > 6 && (
                <TextInput
                  style={[s.searchInput, { color: colors.textPrimary, backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  value={exerciseSearch}
                  onChangeText={setExerciseSearch}
                  placeholder="Search exercises..."
                  placeholderTextColor={colors.textTertiary}
                />
              )}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.pickerRow}
              >
                {filteredExerciseNames.map(name => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => { setSelectedExercise(name); setExerciseSearch(''); }}
                    onLongPress={() => handleDeleteExercise(name)}
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
                        { color: name === selectedExercise ? colors.surface : colors.textSecondary },
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

              <View style={s.bottomSpacer} />
            </>
          )}
        </ScrollView>
        <BottomNav />
      </View>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 24 },
  pageTitle: { fontSize: 28, fontWeight: '700', marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 28, marginBottom: 8 },
  sectionSub: { fontSize: 13, marginBottom: 12 },
  searchInput: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
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
  loadingIndicator: { marginTop: 60 },
  bottomSpacer: { height: 100 },
});
