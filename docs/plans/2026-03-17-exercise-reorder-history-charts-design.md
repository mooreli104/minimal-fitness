# Design: Exercise Reorder, History Per Day, Charts, Blue Fix

**Date:** 2026-03-17

## Overview

Four improvements to the minimal-fitness app:
1. Drag-to-reorder exercises within a workout day
2. View all past logged data for a specific exercise on a specific workout day
3. New Stats tab with weight progression and workout frequency charts
4. Muted blue color in dark mode

---

## 1. Exercise Reordering

**Library:** `react-native-draggable-flatlist`

- Replace the current list render in `WorkoutTable.tsx` with `DraggableFlatList`
- Add a drag handle icon (≡) on the left of each `ExerciseRow`
- `DraggableFlatList` provides `drag` and `isActive` props per item
- On drag end, persist the new exercise order via the existing update callback to AsyncStorage
- Active row gets scale/elevation animation (handled by library)

---

## 2. View All Past Sets/Reps/Weight Per Workout Day

**Access:** Small history icon button on each exercise row

**Behavior:**
- Tapping opens a modal showing every logged session for that exercise on the current workout day
- Entries ordered newest → oldest
- Each entry shows: date, target, actual, weight

**New service function:** `findExerciseHistoryForDay(exerciseName: string, workoutDayId: number): ExerciseHistoryEntry[]`
- Scans all `@workoutlog_YYYY-MM-DD` AsyncStorage keys
- Filters to logs where the workout day ID matches the current day
- Finds the matching exercise by name within each matching log
- Returns array of history entries sorted newest first

**UI:** Scrollable modal, styled consistently with existing `ExerciseHistoryModal`

---

## 3. Stats Tab (Charts)

**Navigation:** New third tab "Stats" added to `TabNavigator`

**New screen:** `src/screens/Stats.tsx`

### Weight Progression (Line Chart)

- Exercise picker/dropdown populated from all historically logged exercise names
- Line chart (via `react-native-gifted-charts`) showing weight over time for selected exercise
- X-axis: dates, Y-axis: numeric weight (parsed from weight string, e.g. "185 lbs" → 185)
- Sessions with empty weight are skipped

### Workout Frequency (Bar Chart)

- Bar chart showing number of workouts logged per week for the past 12 weeks
- X-axis: week labels, Y-axis: session count
- Computed by scanning all `@workoutlog_YYYY-MM-DD` keys and grouping by ISO week

---

## 4. Dark Mode Blue Color

**File:** `src/context/ThemeContext.tsx`

- Change `blue` dark mode value from `#60A5FA` → `#4A80C4`
- Single line change; no other files affected

---

## Libraries to Add

| Library | Purpose |
|---|---|
| `react-native-draggable-flatlist` | Drag-to-reorder exercises |
| `react-native-gifted-charts` | Line and bar charts |

Both are Expo-compatible and built on Reanimated (already installed).
