# Exercise Reorder, History Per Day, Stats Charts, Blue Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add drag-to-reorder exercises, per-workout-day exercise history, a Stats tab with charts, and fix the overly bright blue in dark mode.

**Architecture:** DraggableFlatList replaces the current exercise map in WorkoutTable. History filtering adds a `workoutDayName` scope to the existing modal. A new Stats screen is added as a third tab, using react-native-gifted-charts for line/bar charts, reading from existing AsyncStorage logs.

**Tech Stack:** react-native-draggable-flatlist, react-native-gifted-charts, existing Reanimated v4, Gesture Handler, AsyncStorage, lucide-react-native icons

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json` (auto-updated by npm)

**Step 1: Install the two new libraries**

```bash
npx expo install react-native-draggable-flatlist react-native-gifted-charts
```

**Step 2: Verify they appear in package.json**

```bash
grep -E "draggable-flatlist|gifted-charts" package.json
```

Expected: both library lines appear.

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: install draggable-flatlist and gifted-charts"
```

---

## Task 2: Fix dark mode blue color

**Files:**
- Modify: `src/context/ThemeContext.tsx:69`

**Step 1: Change the dark mode blue value**

In `src/context/ThemeContext.tsx`, find line 69:
```ts
  blue: '#60A5FA',
```
Change to:
```ts
  blue: '#4A80C4',
```

**Step 2: Commit**

```bash
git add src/context/ThemeContext.tsx
git commit -m "fix: mute dark mode blue from #60A5FA to #4A80C4"
```

---

## Task 3: Add `reorderExercises` to useWorkoutLog

**Files:**
- Modify: `src/hooks/useWorkoutLog.ts`

**Step 1: Add the function after `deleteExercise` (around line 89)**

```ts
const reorderExercises = useCallback((newOrder: Exercise[]) => {
  mutateLog(log => ({ ...log, exercises: newOrder }));
}, [mutateLog]);
```

**Step 2: Add `reorderExercises` to the return object (around line 117)**

```ts
return {
  workoutLog,
  previousExercises,
  yesterdaysWorkoutName,
  isLoading,
  setWorkoutLog,
  loadData,
  addExercise,
  updateExercise,
  deleteExercise,
  reorderExercises,   // <-- add this
  selectDayToLog,
  markRestDay,
  renameLog,
  saveLog,
};
```

**Step 3: Commit**

```bash
git add src/hooks/useWorkoutLog.ts
git commit -m "feat: add reorderExercises to useWorkoutLog"
```

---

## Task 4: Add `findExerciseHistoryForDay` service function

**Files:**
- Modify: `src/services/workoutStorage.service.ts`

**Step 1: Add the function after `findExerciseHistory` (around line 180)**

```ts
/**
 * Finds all occurrences of a specific exercise for a specific workout day name
 * @param exerciseName Name of the exercise to search for
 * @param workoutDayName Name of the workout day to filter by (e.g. "Upper A")
 * @param maxDaysBack Maximum number of days to search back (default 365)
 * @returns Array of exercise history entries, newest first
 */
export const findExerciseHistoryForDay = async (
  exerciseName: string,
  workoutDayName: string,
  maxDaysBack: number = 365
): Promise<ExerciseHistoryEntry[]> => {
  const results: ExerciseHistoryEntry[] = [];
  if (!exerciseName.trim() || !workoutDayName.trim()) return results;

  const today = new Date();

  for (let i = 1; i <= maxDaysBack; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    const log = await loadWorkoutLog(checkDate);
    if (!log || log.isRest || !log.exercises) continue;
    if (log.name.toLowerCase() !== workoutDayName.toLowerCase()) continue;

    const match = log.exercises.find(
      ex => ex.name.toLowerCase() === exerciseName.toLowerCase() &&
            (ex.actual || ex.weight)
    );

    if (match) {
      results.push({
        date: formatDateToKey(checkDate),
        workoutName: log.name,
        target: match.target,
        actual: match.actual,
        weight: match.weight,
      });
    }
  }
  return results;
};
```

**Step 2: Commit**

```bash
git add src/services/workoutStorage.service.ts
git commit -m "feat: add findExerciseHistoryForDay service function"
```

---

## Task 5: Update ExerciseHistoryModal to support workout-day-scoped history

**Files:**
- Modify: `src/components/workout/ExerciseHistoryModal.tsx`

**Step 1: Add `workoutDayName` prop to interface (around line 8)**

```ts
interface Props {
  isVisible: boolean;
  exerciseName: string;
  workoutDayName?: string;   // <-- add this
  currentDate: Date;
  onClose: () => void;
}
```

**Step 2: Update component signature (around line 15)**

```ts
export const ExerciseHistoryModal = ({ isVisible, exerciseName, workoutDayName, currentDate, onClose }: Props) => {
```

**Step 3: Update the import at line 6 to also import the new function**

```ts
import { findExerciseHistory, findExerciseHistoryForDay } from '../../services/workoutStorage.service';
```

**Step 4: Update the useEffect data-fetch (around line 20–26)**

```ts
useEffect(() => {
  if (!isVisible || !exerciseName.trim()) return;
  setLoading(true);
  const fetchHistory = workoutDayName
    ? findExerciseHistoryForDay(exerciseName, workoutDayName)
    : findExerciseHistory(exerciseName, currentDate);
  fetchHistory
    .then(setHistory)
    .finally(() => setLoading(false));
}, [isVisible, exerciseName, workoutDayName, currentDate]);
```

**Step 5: Commit**

```bash
git add src/components/workout/ExerciseHistoryModal.tsx
git commit -m "feat: scope ExerciseHistoryModal to specific workout day when workoutDayName provided"
```

---

## Task 6: Update ExerciseRow — add history button and drag handle props

**Files:**
- Modify: `src/components/workout/ExerciseRow.tsx`

**Step 1: Add new props to interface (around line 12)**

```ts
interface ExerciseRowProps {
  item: Exercise;
  previousExercise?: Exercise;
  onExerciseChange: (id: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (id: number) => void;
  onShowHistory?: (exerciseName: string) => void;
  drag?: () => void;
  isActive?: boolean;
}
```

**Step 2: Update component signature (line 19)**

```ts
const ExerciseRow = ({ item, previousExercise, onExerciseChange, onDeleteExercise, onShowHistory, drag, isActive }: ExerciseRowProps) => {
```

**Step 3: Add imports for new icons (line 5)**

```ts
import { Trash2, GripVertical, Clock } from 'lucide-react-native';
```

**Step 4: Replace the return JSX**

The outer wrapper gets an opacity when dragging. Add a drag handle on the far left and a history clock icon next to the exercise name. The full return:

```tsx
return (
  <View style={[styles.exerciseRowContainer, isActive && { opacity: 0.9 }]}>
    <View style={styles.exerciseDeleteActionContainer}>
      <TouchableOpacity style={styles.exerciseDeleteButton} onPress={() => onDeleteExercise(item.id)}>
        <Trash2 size={20} color="white" />
      </TouchableOpacity>
    </View>
    <GestureDetector gesture={panGesture}>
      <Reanimated.View style={[styles.row, animatedStyle]}>
        {/* Drag handle */}
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={150}
          style={{ paddingHorizontal: 6, justifyContent: 'center' }}
        >
          <GripVertical size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Exercise name + history button */}
        <View style={[styles.exerciseCol, { flexDirection: 'row', alignItems: 'center' }]}>
          <TextInput
            style={[styles.cell, { flex: 1 }]}
            value={item.name}
            placeholder="Exercise Name"
            placeholderTextColor={colors.textSecondary}
            scrollEnabled={false}
            multiline
            numberOfLines={2}
            textAlignVertical="center"
            onChangeText={(text) => onExerciseChange(item.id, 'name', text)}
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
          {onShowHistory && (
            <TouchableOpacity
              onPress={() => onShowHistory(item.name)}
              style={{ paddingLeft: 4, paddingRight: 2 }}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Clock size={14} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={[styles.cell, styles.targetActualCol]}
          value={item.target}
          placeholder={previousExercise?.target || "3x8"}
          placeholderTextColor={colors.textSecondary}
          scrollEnabled={false}
          onChangeText={(text) => onExerciseChange(item.id, 'target', text)}
          keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
        />
        <TextInput
          style={[styles.cell, styles.targetActualCol]}
          value={item.actual}
          placeholder={previousExercise?.actual || "SetxRep"}
          placeholderTextColor={colors.textSecondary}
          scrollEnabled={false}
          onChangeText={(text) => onExerciseChange(item.id, 'actual', text)}
          keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
        />
        <TextInput
          style={[styles.cell, styles.numberCol]}
          value={item.weight}
          placeholder={previousExercise?.weight || "-"}
          placeholderTextColor={colors.textSecondary}
          scrollEnabled={false}
          onChangeText={(text) => onExerciseChange(item.id, 'weight', text)}
          keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
        />
      </Reanimated.View>
    </GestureDetector>
  </View>
);
```

**Step 5: Commit**

```bash
git add src/components/workout/ExerciseRow.tsx
git commit -m "feat: add drag handle and history button to ExerciseRow"
```

---

## Task 7: Update WorkoutTable to use DraggableFlatList

**Files:**
- Modify: `src/components/workout/WorkoutTable.tsx`

**Step 1: Update imports**

```ts
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Plus } from 'lucide-react-native';
import { Exercise } from '../../types';
import ExerciseRow from './ExerciseRow';
import { getWorkoutStyles } from '../../styles/Workout.styles';
import { useTheme } from '../../context/ThemeContext';
```

**Step 2: Add `onReorderExercises` to interface (around line 9)**

```ts
interface WorkoutTableProps {
  exercises: Exercise[];
  previousExercises: Exercise[];
  onExerciseChange: (id: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (id: number) => void;
  onAddExercise: () => void;
  onReorderExercises: (newOrder: Exercise[]) => void;
  onShowHistory?: (exerciseName: string) => void;
}
```

**Step 3: Update component signature**

```ts
const WorkoutTable = ({
  exercises,
  previousExercises,
  onExerciseChange,
  onDeleteExercise,
  onAddExercise,
  onReorderExercises,
  onShowHistory,
}: WorkoutTableProps) => {
```

**Step 4: Add renderItem callback**

```ts
const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Exercise>) => (
  <ScaleDecorator>
    <ExerciseRow
      item={item}
      previousExercise={findPreviousExercise(item.name)}
      onExerciseChange={onExerciseChange}
      onDeleteExercise={onDeleteExercise}
      onShowHistory={onShowHistory}
      drag={drag}
      isActive={isActive}
    />
  </ScaleDecorator>
), [findPreviousExercise, onExerciseChange, onDeleteExercise, onShowHistory]);
```

**Step 5: Replace the `exercises.map(...)` block with DraggableFlatList**

Replace:
```tsx
{exercises.map((item) => (
  <ExerciseRow
    key={item.id}
    item={item}
    previousExercise={findPreviousExercise(item.name)}
    onExerciseChange={onExerciseChange}
    onDeleteExercise={onDeleteExercise}
    onShowHistory={onShowHistory}
  />
))}
```

With:
```tsx
<DraggableFlatList
  data={exercises}
  keyExtractor={(item) => item.id.toString()}
  renderItem={renderItem}
  onDragEnd={({ data }) => onReorderExercises(data)}
  scrollEnabled={false}
/>
```

**Step 6: Commit**

```bash
git add src/components/workout/WorkoutTable.tsx
git commit -m "feat: replace exercise map with DraggableFlatList for drag reordering"
```

---

## Task 8: Wire reorder and history day name through WorkoutContent and Workout

**Files:**
- Modify: `src/components/workout/WorkoutContent.tsx`
- Modify: `src/screens/Workout.tsx`

**Step 1: Add `onReorderExercises` to WorkoutContentProps (WorkoutContent.tsx line 9)**

```ts
interface WorkoutContentProps {
  workoutLog: WorkoutDay | null;
  previousExercises: Exercise[];
  isLoading: boolean;
  onOpenRenameModal: () => void;
  onToggleRestDay: () => void;
  onUpdateExercise: (exerciseId: number, field: keyof Exercise, value: string) => void;
  onDeleteExercise: (exerciseId: number) => void;
  onAddExercise: () => void;
  onReorderExercises: (newOrder: Exercise[]) => void;
  onShowHistory?: (exerciseName: string) => void;
}
```

**Step 2: Pass it through to WorkoutTable in WorkoutContent.tsx**

Add to component signature and pass to WorkoutTable:
```tsx
<WorkoutTable
  exercises={workoutLog.exercises}
  previousExercises={previousExercises}
  onExerciseChange={onUpdateExercise}
  onDeleteExercise={onDeleteExercise}
  onAddExercise={onAddExercise}
  onReorderExercises={onReorderExercises}
  onShowHistory={onShowHistory}
/>
```

**Step 3: In Workout.tsx, wire up reorderExercises from hook**

The hook already returns `reorderExercises` (added in Task 3). Pass it to WorkoutContent:

```tsx
<WorkoutContent
  workoutLog={workoutLog}
  previousExercises={previousExercises}
  isLoading={isLoading}
  onOpenRenameModal={() => {
    if (workoutLog) {
      setNewDayName(workoutLog.name);
      modals.renameModal.open();
    }
  }}
  onToggleRestDay={handleToggleRestDay}
  onUpdateExercise={updateExercise}
  onDeleteExercise={deleteExercise}
  onAddExercise={addExercise}
  onReorderExercises={reorderExercises}
  onShowHistory={handleShowHistory}
/>
```

**Step 4: Pass `workoutDayName` to ExerciseHistoryModal in Workout.tsx**

Update the ExerciseHistoryModal usage (around line 202):
```tsx
<ExerciseHistoryModal
  isVisible={isHistoryVisible}
  exerciseName={historyExercise}
  workoutDayName={workoutLog?.name}
  currentDate={selectedDate}
  onClose={() => setIsHistoryVisible(false)}
/>
```

**Step 5: Commit**

```bash
git add src/components/workout/WorkoutContent.tsx src/screens/Workout.tsx
git commit -m "feat: wire exercise reorder and day-scoped history through component tree"
```

---

## Task 9: Add weight parsing utility

**Files:**
- Create: `src/utils/parseWeight.ts`

**Step 1: Create the utility**

```ts
/**
 * Parses a weight string like "185 lbs", "90kg", "100 kg", "225" into a number.
 * Returns null if the string contains no parseable number.
 */
export const parseWeight = (weightStr: string): number | null => {
  if (!weightStr || !weightStr.trim()) return null;
  const match = weightStr.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return isNaN(value) ? null : value;
};
```

**Step 2: Commit**

```bash
git add src/utils/parseWeight.ts
git commit -m "feat: add parseWeight utility"
```

---

## Task 10: Add Stats service helpers

**Files:**
- Modify: `src/services/workoutStorage.service.ts`

**Step 1: Add import for AsyncStorage at the top if not already present**

The file already imports indirectly through `storage` utils. Add a direct import:
```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
```

**Step 2: Add `getAllWorkoutLogs` function after `findExerciseHistoryForDay`**

```ts
/**
 * Returns all workout log entries across all stored dates, newest first.
 * Used for building stats/charts.
 */
export const getAllWorkoutLogs = async (): Promise<Array<{ date: string; log: WorkoutDay }>> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const logKeys = allKeys.filter(k => k.startsWith(STORAGE_KEYS.WORKOUT_LOG_PREFIX));

    const pairs = await AsyncStorage.multiGet(logKeys);
    const results: Array<{ date: string; log: WorkoutDay }> = [];

    for (const [key, value] of pairs) {
      if (!value) continue;
      try {
        const log: WorkoutDay = JSON.parse(value);
        const date = key.replace(STORAGE_KEYS.WORKOUT_LOG_PREFIX, '');
        if (!log.isRest) results.push({ date, log });
      } catch {
        // skip malformed entries
      }
    }

    return results.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
};
```

**Step 3: Commit**

```bash
git add src/services/workoutStorage.service.ts
git commit -m "feat: add getAllWorkoutLogs service for stats screen"
```

---

## Task 11: Add Stats to types and navigation

**Files:**
- Modify: `src/types/index.ts:43`
- Modify: `src/navigation/TabNavigator.tsx`
- Modify: `src/components/BottomNav.tsx`

**Step 1: Add Stats to RootStackParamList in types/index.ts**

```ts
export type RootStackParamList = {
  Workout: undefined;
  Stats: undefined;
  More: undefined;
};
```

**Step 2: Add Stats screen to TabNavigator.tsx**

```ts
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';
import Workout from '../screens/Workout';
import Stats from '../screens/Stats';
import More from '../screens/More';

const Tab = createBottomTabNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      initialRouteName="Workout"
    >
      <Tab.Screen name="Workout" component={Workout} />
      <Tab.Screen name="Stats" component={Stats} />
      <Tab.Screen name="More" component={More} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
```

**Step 3: Add Stats icon to BottomNav.tsx**

Import `BarChart2` from lucide and add Stats nav item:

```ts
import { Menu, Dumbbell, BarChart2 } from 'lucide-react-native';
```

Update navItems:
```ts
const navItems = [
  { icon: Dumbbell, route: 'Workout', name: 'workout' },
  { icon: BarChart2, route: 'Stats', name: 'stats' },
  { icon: Menu, route: 'More', name: 'more' },
];
```

**Step 4: Commit**

```bash
git add src/types/index.ts src/navigation/TabNavigator.tsx src/components/BottomNav.tsx
git commit -m "feat: add Stats tab to navigation"
```

---

## Task 12: Build Stats screen

**Files:**
- Create: `src/screens/Stats.tsx`

**Step 1: Create the screen**

```tsx
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

const getISOWeekLabel = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  // Get Monday of that week
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
};

export default function Stats() {
  const { colors } = useTheme();

  const [allExerciseNames, setAllExerciseNames] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([]);
  const [frequencyData, setFrequencyData] = useState<WeekCount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const logs = await getAllWorkoutLogs();

    // --- Frequency chart: workouts per week for last 12 weeks ---
    const weekMap = new Map<string, number>();
    const now = new Date();
    // Seed last 12 weeks with 0
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const label = getISOWeekLabel(
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      );
      if (!weekMap.has(label)) weekMap.set(label, 0);
    }
    for (const { date } of logs) {
      const label = getISOWeekLabel(date);
      if (weekMap.has(label)) {
        weekMap.set(label, (weekMap.get(label) ?? 0) + 1);
      }
    }
    const freqArr: WeekCount[] = Array.from(weekMap.entries()).map(([label, value]) => ({ label, value }));
    setFrequencyData(freqArr);

    // --- Collect all unique exercise names ---
    const nameSet = new Set<string>();
    for (const { log } of logs) {
      for (const ex of log.exercises ?? []) {
        if (ex.name?.trim()) nameSet.add(ex.name.trim());
      }
    }
    const names = Array.from(nameSet).sort();
    setAllExerciseNames(names);
    if (!selectedExercise && names.length > 0) setSelectedExercise(names[0]);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build weight progression data whenever selectedExercise changes
  useEffect(() => {
    if (!selectedExercise) return;
    (async () => {
      const logs = await getAllWorkoutLogs();
      const points: WeightDataPoint[] = [];
      for (const { date, log } of [...logs].reverse()) {
        const match = log.exercises?.find(
          ex => ex.name.trim().toLowerCase() === selectedExercise.toLowerCase() && ex.weight
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
    })();
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
              {/* ── Weight Progression ── */}
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Weight Progression</Text>

              {/* Exercise picker */}
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

              {/* ── Workout Frequency ── */}
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
```

**Step 2: Commit**

```bash
git add src/screens/Stats.tsx src/utils/parseWeight.ts
git commit -m "feat: add Stats screen with weight progression and frequency charts"
```

---

## Task 13: Smoke test

**Step 1: Start the app**

```bash
npx expo start
```

**Step 2: Verify each feature**

- [ ] Dark mode blue is visibly softer (Settings → toggle dark mode)
- [ ] Exercise rows have a ≡ drag handle on the left; long-press and drag reorders them
- [ ] Exercise rows have a clock icon next to the name; tapping it shows all past entries for that exercise on the current workout day name
- [ ] Bottom nav has three icons (workout, bar chart, menu)
- [ ] Stats tab loads, shows exercise pills, weight line chart renders when an exercise with weight history is selected
- [ ] Frequency bar chart shows 12 weeks

**Step 3: Final commit if any polish fixes needed**

```bash
git add -p
git commit -m "fix: stats screen polish"
```
