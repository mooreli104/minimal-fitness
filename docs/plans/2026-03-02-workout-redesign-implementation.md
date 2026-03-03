# Workout Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the workout screen with a program editor modal, exercise history modal, calendar accountability (red unlogged days), and SOLID/DRY refactoring.

**Architecture:** Full-screen modal for program editing (same pattern as TemplateManager). Exercise history via tap-to-view modal. Calendar updated to show red for any unlogged past day and blue for rest days. Refactor extracts business logic from screen component into focused hooks.

**Tech Stack:** React Native, Expo, AsyncStorage, react-native-gesture-handler, react-native-reanimated, lucide-react-native

---

### Task 1: Clean up dead code and stale references

**Files:**
- Delete: `src/components/workout/LoopingTimer.tsx`
- Delete: `src/components/WorkoutDayActionSheet.tsx`
- Delete: `src/styles/WorkoutDayActionSheet.styles.ts`
- Modify: `src/utils/constants.ts` — remove food-related keys/defaults
- Modify: `src/components/TemplateManager.tsx` — remove dead `defaultTemplates` import (file was already deleted)

**Step 1: Delete dead files**

```bash
rm src/components/workout/LoopingTimer.tsx
rm src/components/WorkoutDayActionSheet.tsx
rm src/styles/WorkoutDayActionSheet.styles.ts
```

**Step 2: Clean up constants.ts**

Remove from `STORAGE_KEYS`: `FOOD_LOG_PREFIX`, `CALORIE_TARGET`, `PROTEIN_TARGET`, `CARBS_TARGET`, `FAT_TARGET`, `WEIGHT_ENTRIES`.

Remove from `DEFAULTS`: `CALORIE_TARGET`, `PROTEIN_TARGET`, `CARBS_TARGET`, `FAT_TARGET`.

Remove from `UI`: `TOP_FOODS_LIMIT`.

**Step 3: Fix TemplateManager.tsx broken import**

Remove `import { defaultTemplates } from "../data/defaultTemplates";` and the "Default Templates" section that maps over `defaultTemplates`. Keep only the "My Templates" section.

**Step 4: Remove WorkoutDayActionSheet import from Workout.tsx**

Remove the import and the `<WorkoutDayActionSheet>` JSX block. Remove `handleEditDay`, `handleDuplicateDay`, `handleDeleteDay` handlers (these will be reimplemented in the program editor). Remove `selectedDay` state.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove dead code and stale references

Delete LoopingTimer (replaced by InlineLoopingTimer), WorkoutDayActionSheet
(replaced by program editor), broken defaultTemplates import, and food-related
constants."
```

---

### Task 2: Extract `useWorkoutLog` hook (Single Responsibility)

**Files:**
- Create: `src/hooks/useWorkoutLog.ts`
- Modify: `src/hooks/useWorkout.ts` — slim down to composition only
- Modify: `src/hooks/index.ts` — add export

**Step 1: Create useWorkoutLog.ts**

This hook owns ONLY the daily log concern: loading, saving, and mutating the current day's workout log.

```typescript
// src/hooks/useWorkoutLog.ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Exercise, WorkoutDay } from '../types';
import { generateId, generateUniqueId } from '../utils/generators';
import { DEFAULTS } from '../utils/constants';
import {
  loadWorkoutLog as loadWorkoutLogService,
  saveWorkoutLog as saveWorkoutLogService,
  deleteWorkoutLog,
  findPreviousWorkoutByName,
} from '../services/workoutStorage.service';
import { getYesterday } from '../utils/formatters';

export const useWorkoutLog = (selectedDate: Date) => {
  const [workoutLog, setWorkoutLog] = useState<WorkoutDay | null>(null);
  const [previousWorkout, setPreviousWorkout] = useState<WorkoutDay | null>(null);
  const [yesterdaysWorkoutName, setYesterdaysWorkoutName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveLog = useCallback(async (log: WorkoutDay | null) => {
    try {
      if (log) {
        await saveWorkoutLogService(selectedDate, log);
      } else {
        await deleteWorkoutLog(selectedDate);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout log.');
    }
  }, [selectedDate]);

  /** Apply a transform to the current log and persist */
  const mutateLog = useCallback((transform: (log: WorkoutDay) => WorkoutDay) => {
    if (!workoutLog) return;
    const updated = transform(workoutLog);
    setWorkoutLog(updated);
    saveLog(updated);
  }, [workoutLog, saveLog]);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const log = await loadWorkoutLogService(selectedDate);
      setWorkoutLog(log);

      if (log && !log.isRest && log.name) {
        const prev = await findPreviousWorkoutByName(log.name, selectedDate);
        setPreviousWorkout(prev);
      } else {
        setPreviousWorkout(null);
      }

      const yesterdayLog = await loadWorkoutLogService(getYesterday(selectedDate));
      setYesterdaysWorkoutName(
        yesterdayLog ? (yesterdayLog.isRest ? 'REST_DAY' : yesterdayLog.name ?? null) : null
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout data.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [selectedDate]);

  const addExercise = useCallback(() => {
    if (!workoutLog) {
      const newWorkout: WorkoutDay = {
        id: generateUniqueId(),
        name: 'Workout',
        exercises: [{ id: generateUniqueId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
      };
      setWorkoutLog(newWorkout);
      saveLog(newWorkout);
      return;
    }
    mutateLog(log => ({
      ...log,
      exercises: [...log.exercises, { id: generateUniqueId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
    }));
  }, [workoutLog, saveLog, mutateLog]);

  const updateExercise = useCallback((exerciseId: number, field: keyof Exercise, value: string) => {
    mutateLog(log => ({
      ...log,
      exercises: log.exercises.map(ex => ex.id === exerciseId ? { ...ex, [field]: value } : ex),
    }));
  }, [mutateLog]);

  const deleteExercise = useCallback((exerciseId: number) => {
    mutateLog(log => ({
      ...log,
      exercises: log.exercises.filter(ex => ex.id !== exerciseId),
    }));
  }, [mutateLog]);

  const selectDayToLog = useCallback(async (dayToLog: WorkoutDay) => {
    const newLog: WorkoutDay = {
      ...structuredClone(dayToLog),
      id: generateUniqueId(),
      exercises: dayToLog.isRest ? [] : dayToLog.exercises.map(ex => ({
        ...ex,
        id: generateUniqueId(),
        actual: '',
        weight: '',
      })),
    };
    setWorkoutLog(newLog);
    await saveLog(newLog);

    if (!dayToLog.isRest && dayToLog.name) {
      const prev = await findPreviousWorkoutByName(dayToLog.name, selectedDate);
      setPreviousWorkout(prev);
    } else {
      setPreviousWorkout(null);
    }
  }, [saveLog, selectedDate]);

  const markRestDay = useCallback(() => {
    mutateLog(log => ({ ...log, isRest: true }));
  }, [mutateLog]);

  const renameLog = useCallback((newName: string) => {
    mutateLog(log => ({ ...log, name: newName }));
  }, [mutateLog]);

  return {
    workoutLog,
    previousWorkout,
    yesterdaysWorkoutName,
    isLoading,
    setWorkoutLog,
    loadData,
    addExercise,
    updateExercise,
    deleteExercise,
    selectDayToLog,
    markRestDay,
    renameLog,
    saveLog,
  };
};
```

**Step 2: Slim down useWorkout.ts to a composition hook**

```typescript
// src/hooks/useWorkout.ts
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { WorkoutTemplate } from '../types';
import { useWorkoutLog } from './useWorkoutLog';
import { useWorkoutProgram } from './useWorkoutProgram';
import { useWorkoutTemplates } from './useWorkoutTemplates';

export const useWorkout = (selectedDate: Date) => {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const isFocused = useIsFocused();

  const log = useWorkoutLog(selectedDate);
  const programManager = useWorkoutProgram();
  const templateManager = useWorkoutTemplates(programManager.program);

  useEffect(() => {
    log.loadData(true).then(() => setHasInitiallyLoaded(true));
  }, [log.loadData]);

  useEffect(() => {
    if (isFocused && hasInitiallyLoaded) {
      log.loadData(false);
    }
  }, [isFocused, hasInitiallyLoaded, log.loadData]);

  const loadTemplate = (template: WorkoutTemplate) => {
    programManager.setProgram(template.days.map(day => ({
      ...day,
      isRest: day.isRest ?? false,
    })));
    log.setWorkoutLog(null);
  };

  return {
    ...log,
    program: programManager.program,
    ...programManager,
    templates: templateManager.templates,
    ...templateManager,
    loadTemplate,
  };
};
```

**Step 3: Update hooks/index.ts**

Add `export { useWorkoutLog } from './useWorkoutLog';`

**Step 4: Verify app still works**

Run: `npx expo start` — verify the workout screen loads and basic logging works.

**Step 5: Commit**

```bash
git add src/hooks/useWorkoutLog.ts src/hooks/useWorkout.ts src/hooks/index.ts
git commit -m "refactor: extract useWorkoutLog for single responsibility

Split daily log concerns (load/save/mutate) into dedicated hook.
useWorkout becomes a thin composition layer. Replaces JSON.parse
deep-clone with structuredClone, uses generateUniqueId consistently,
adds mutateLog helper to eliminate repeated map/spread/save pattern."
```

---

### Task 3: Add program-level exercise CRUD to `useWorkoutProgram`

**Files:**
- Modify: `src/hooks/useWorkoutProgram.ts`

**Step 1: Add exercise management methods**

Add these methods to the existing hook:

```typescript
const addExerciseToDay = useCallback(async (dayId: number) => {
  const newProgram = program.map(day => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: [...day.exercises, { id: generateUniqueId(), ...DEFAULTS.NEW_EXERCISE_TEMPLATE }],
    };
  });
  await saveProgram(newProgram);
}, [program]);

const updateExerciseInDay = useCallback(async (
  dayId: number, exerciseId: number, field: 'name' | 'target', value: string
) => {
  const newProgram = program.map(day => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      ),
    };
  });
  await saveProgram(newProgram);
}, [program]);

const removeExerciseFromDay = useCallback(async (dayId: number, exerciseId: number) => {
  const newProgram = program.map(day => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.filter(ex => ex.id !== exerciseId),
    };
  });
  await saveProgram(newProgram);
}, [program]);

const reorderDays = useCallback(async (newOrder: WorkoutDay[]) => {
  await saveProgram(newOrder);
}, []);
```

Also replace `generateId()` with `generateUniqueId()` in `addDayToProgram`.

Return the new methods from the hook.

**Step 2: Commit**

```bash
git add src/hooks/useWorkoutProgram.ts
git commit -m "feat: add exercise CRUD and reorder to program hook

Enables editing exercises at the program template level (name + target).
Uses generateUniqueId consistently."
```

---

### Task 4: Build `ExerciseHistoryModal` component and service function

**Files:**
- Create: `src/components/workout/ExerciseHistoryModal.tsx`
- Modify: `src/services/workoutStorage.service.ts` — add `findExerciseHistory`
- Modify: `src/types/index.ts` — add `ExerciseHistoryEntry` type

**Step 1: Add type**

```typescript
// Add to src/types/index.ts
export interface ExerciseHistoryEntry {
  date: string;           // YYYY-MM-DD
  workoutName: string;
  target: string;
  actual: string;
  weight: string;
}
```

**Step 2: Add `findExerciseHistory` to workoutStorage.service.ts**

```typescript
export const findExerciseHistory = async (
  exerciseName: string,
  beforeDate: Date,
  maxDaysBack: number = 90
): Promise<ExerciseHistoryEntry[]> => {
  const results: ExerciseHistoryEntry[] = [];
  if (!exerciseName.trim()) return results;

  for (let i = 1; i <= maxDaysBack; i++) {
    const checkDate = new Date(beforeDate);
    checkDate.setDate(checkDate.getDate() - i);

    const log = await loadWorkoutLog(checkDate);
    if (!log || log.isRest || !log.exercises) continue;

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

Import `ExerciseHistoryEntry` from types and `formatDateToKey` (already imported).

**Step 3: Build ExerciseHistoryModal**

```typescript
// src/components/workout/ExerciseHistoryModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ExerciseHistoryEntry } from '../../types';
import { findExerciseHistory } from '../../services/workoutStorage.service';

interface Props {
  isVisible: boolean;
  exerciseName: string;
  currentDate: Date;
  onClose: () => void;
}

export const ExerciseHistoryModal = ({ isVisible, exerciseName, currentDate, onClose }: Props) => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isVisible || !exerciseName.trim()) return;
    setLoading(true);
    findExerciseHistory(exerciseName, currentDate)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [isVisible, exerciseName, currentDate]);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View
          style={[styles.container, { backgroundColor: colors.cardBackground }]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{exerciseName}</Text>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} color={colors.accent} />
          ) : history.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>No previous entries found.</Text>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {history.map((entry, i) => (
                <View key={i} style={[styles.entry, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <View style={styles.entryHeader}>
                    <Text style={[styles.entryDate, { color: colors.textPrimary }]}>{formatDate(entry.date)}</Text>
                    <Text style={[styles.entryWorkout, { color: colors.textTertiary }]}>{entry.workoutName}</Text>
                  </View>
                  <View style={styles.entryDetails}>
                    {entry.target ? <Text style={[styles.detail, { color: colors.textSecondary }]}>Target: {entry.target}</Text> : null}
                    {entry.actual ? <Text style={[styles.detail, { color: colors.textSecondary }]}>Actual: {entry.actual}</Text> : null}
                    {entry.weight ? <Text style={[styles.detail, { color: colors.accent }]}>@ {entry.weight}</Text> : null}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={[styles.closeButton, { borderTopColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.accent }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 16,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 32,
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 20,
  },
  entry: {
    paddingVertical: 14,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '600',
  },
  entryWorkout: {
    fontSize: 13,
  },
  entryDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detail: {
    fontSize: 14,
  },
  closeButton: {
    borderTopWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Step 4: Commit**

```bash
git add src/types/index.ts src/services/workoutStorage.service.ts src/components/workout/ExerciseHistoryModal.tsx
git commit -m "feat: add exercise history modal

Tap an exercise name to see all past occurrences (up to 90 days)
with date, workout name, target, actual, and weight."
```

---

### Task 5: Wire ExerciseHistoryModal into ExerciseRow and Workout screen

**Files:**
- Modify: `src/components/workout/ExerciseRow.tsx` — add tap handler on exercise name
- Modify: `src/components/workout/WorkoutTable.tsx` — pass through history callback
- Modify: `src/components/workout/WorkoutContent.tsx` — pass through history callback
- Modify: `src/screens/Workout.tsx` — add history modal state and component

**Step 1: Add `onShowHistory` prop to ExerciseRow**

In `ExerciseRow.tsx`, add `onShowHistory?: (exerciseName: string) => void` to props. Wrap the exercise name `TextInput` — when the name has content and user long-presses, call `onShowHistory(item.name)`. Use `onBlur` or a separate small icon button (history clock icon) to avoid conflicting with text editing.

Implementation: Add a small `Clock` icon from lucide that appears to the left of the exercise name when `item.name` is not empty. Tapping it triggers `onShowHistory`.

```typescript
// In ExerciseRow, add to the row before the name TextInput:
{item.name.trim() && onShowHistory && (
  <TouchableOpacity
    onPress={() => onShowHistory(item.name)}
    style={{ justifyContent: 'center', paddingLeft: 8 }}
  >
    <Clock size={14} color={colors.textTertiary} />
  </TouchableOpacity>
)}
```

**Step 2: Thread the callback through WorkoutTable and WorkoutContent**

- `WorkoutTable`: Add `onShowHistory?: (name: string) => void` prop, pass to each `ExerciseRow`
- `WorkoutContent`: Add `onShowHistory?: (name: string) => void` prop, pass to `WorkoutTable`

**Step 3: Add modal state and component to Workout.tsx**

```typescript
// In Workout.tsx state:
const [historyExercise, setHistoryExercise] = useState<string>('');
const [isHistoryVisible, setIsHistoryVisible] = useState(false);

const handleShowHistory = (exerciseName: string) => {
  setHistoryExercise(exerciseName);
  setIsHistoryVisible(true);
};

// In JSX, add:
<ExerciseHistoryModal
  isVisible={isHistoryVisible}
  exerciseName={historyExercise}
  currentDate={selectedDate}
  onClose={() => setIsHistoryVisible(false)}
/>

// Pass to WorkoutContent:
<WorkoutContent
  ...
  onShowHistory={handleShowHistory}
/>
```

**Step 4: Commit**

```bash
git add src/components/workout/ExerciseRow.tsx src/components/workout/WorkoutTable.tsx \
  src/components/workout/WorkoutContent.tsx src/screens/Workout.tsx
git commit -m "feat: wire exercise history modal into workout table

Tap the clock icon next to an exercise name to view its history."
```

---

### Task 6: Build `ProgramEditor` modal

**Files:**
- Create: `src/components/workout/ProgramEditor.tsx`
- Create: `src/components/workout/ProgramDayCard.tsx`

**Step 1: Build ProgramDayCard**

A collapsible card showing a workout day with its exercises. When expanded, shows editable exercise name + target fields with swipe-to-delete. Only `name` and `target` are editable at program level (no `actual`/`weight`).

```typescript
// src/components/workout/ProgramDayCard.tsx
// Key props:
interface ProgramDayCardProps {
  day: WorkoutDay;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRename: (newName: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleRest: () => void;
  onAddExercise: () => void;
  onUpdateExercise: (exerciseId: number, field: 'name' | 'target', value: string) => void;
  onRemoveExercise: (exerciseId: number) => void;
}
```

- Header: day name (editable on tap), exercise count, `[···]` menu button
- Menu options via a simple dropdown or Alert: Rename, Duplicate, Toggle Rest, Delete
- Collapsed: shows day name + exercise count
- Expanded: shows list of exercises with name + target TextInputs
- Rest days show as a simple card with "Rest Day" label, no exercises
- Swipe-to-delete on exercise rows (reuse gesture pattern from ExerciseRow)

**Step 2: Build ProgramEditor**

```typescript
// src/components/workout/ProgramEditor.tsx
// Full-screen modal, same pattern as TemplateManager
interface ProgramEditorProps {
  isVisible: boolean;
  onClose: () => void;
  program: WorkoutDay[];
  onAddDay: (name: string) => void;
  onRenameDay: (dayId: number, name: string) => void;
  onDuplicateDay: (dayId: number) => void;
  onDeleteDay: (dayId: number) => void;
  onToggleRestDay: (dayId: number) => void;
  onReorderDays: (newOrder: WorkoutDay[]) => void;
  onAddExercise: (dayId: number) => void;
  onUpdateExercise: (dayId: number, exerciseId: number, field: 'name' | 'target', value: string) => void;
  onRemoveExercise: (dayId: number, exerciseId: number) => void;
}
```

- Full-screen Modal with header (title + close button)
- ScrollView of ProgramDayCards
- Footer: "Add Workout Day" and "Add Rest Day" buttons
- "Add Workout Day" shows a cross-platform TextInput modal (NOT Alert.prompt) for the name
- Uses `SafeAreaView` and `KeyboardAvoidingView` like TemplateManager

**Step 3: Commit**

```bash
git add src/components/workout/ProgramDayCard.tsx src/components/workout/ProgramEditor.tsx
git commit -m "feat: add program editor modal with day cards

Full-screen modal for creating and editing workout programs.
Each day is a collapsible card with editable exercises (name + target).
Cross-platform text inputs replace iOS-only Alert.prompt."
```

---

### Task 7: Wire ProgramEditor into Workout screen

**Files:**
- Modify: `src/screens/Workout.tsx` — add ProgramEditor, remove old Alert.prompt patterns
- Modify: `src/hooks/useWorkoutModals.ts` — add programEditor modal state
- Modify: `src/components/workout/WorkoutHeader.tsx` — add "Edit Program" button

**Step 1: Add programEditor to useWorkoutModals**

Add a new modal entry alongside the existing ones.

**Step 2: Update WorkoutHeader**

Add an "Edit" button next to "Templates" that opens the program editor.

```typescript
// WorkoutHeader.tsx — add onOpenProgramEditor prop
<TouchableOpacity onPress={onOpenProgramEditor}>
  <Text style={styles.templateButton}>Edit</Text>
</TouchableOpacity>
```

**Step 3: Add ProgramEditor to Workout.tsx**

```typescript
<ProgramEditor
  isVisible={modals.programEditor.isVisible}
  onClose={modals.programEditor.close}
  program={program}
  onAddDay={addDayToProgram}
  onRenameDay={renameProgramDay}
  onDuplicateDay={duplicateProgramDay}
  onDeleteDay={deleteProgramDay}
  onToggleRestDay={toggleRestDay}
  onReorderDays={reorderDays}
  onAddExercise={addExerciseToDay}
  onUpdateExercise={updateExerciseInDay}
  onRemoveExercise={removeExerciseFromDay}
/>
```

**Step 4: Remove old Alert.prompt calls**

Remove `handleAddDay` (uses Alert.prompt), `handleEditDay` (uses Alert.prompt). The `DaySelector` `onAddDay` should now open the program editor. Long-press on day pills should also open the program editor (scrolled to that day).

**Step 5: Commit**

```bash
git add src/screens/Workout.tsx src/hooks/useWorkoutModals.ts \
  src/components/workout/WorkoutHeader.tsx
git commit -m "feat: wire program editor into workout screen

Replace Alert.prompt day management with full program editor modal.
Add Edit button to header. Day pill long-press opens program editor."
```

---

### Task 8: Update calendar to show red for unlogged days and blue for rest

**Files:**
- Modify: `src/components/workout/WorkoutCalendarModal.tsx`

**Step 1: Update status logic**

In `loadMonthStatuses`, change the `null` status handling for past days:

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
const dateToCheck = new Date(year, month, day);

if (workout) {
  if (workout.isRest) {
    statuses[key] = 'rest';
  } else if (isWorkoutCompleted(workout)) {
    statuses[key] = 'complete';
  } else {
    statuses[key] = 'incomplete';
  }
} else if (dateToCheck < today) {
  statuses[key] = 'unlogged'; // NEW: past day with no log
} else {
  statuses[key] = null; // Future day
}
```

Update `DayStatus` type to include `'unlogged'`.

**Step 2: Update color rendering**

```typescript
// In renderCalendar, update the status color mapping:
if (status === 'rest') {
  backgroundColor = `${colors.blue}40`;  // Blue for rest (was green)
} else if (status === 'complete') {
  backgroundColor = `${colors.green}40`; // Green for complete (unchanged)
} else if (status === 'incomplete' || status === 'unlogged') {
  backgroundColor = `${colors.red}40`;   // Red for incomplete AND unlogged
}
```

**Step 3: Commit**

```bash
git add src/components/workout/WorkoutCalendarModal.tsx
git commit -m "feat: calendar shows red for unlogged past days, blue for rest

Past days with no workout log now show red for accountability.
Rest days show blue instead of green to differentiate from
completed workouts."
```

---

### Task 9: Fix empty state text in WorkoutContent

**Files:**
- Modify: `src/components/workout/WorkoutContent.tsx`

**Step 1: Differentiate null log from rest day**

```typescript
// Replace the single condition:
if (!workoutLog || workoutLog.isRest) {
  return <WorkoutEmptyState text="Today is a rest day." />;
}

// With:
if (!workoutLog) {
  return <WorkoutEmptyState text="Select a workout day above to start logging." />;
}
if (workoutLog.isRest) {
  return <WorkoutEmptyState text="Rest day." />;
}
```

**Step 2: Commit**

```bash
git add src/components/workout/WorkoutContent.tsx
git commit -m "fix: differentiate empty state for no log vs rest day

No log shows hint to select a workout day. Rest day shows
simple rest message."
```

---

### Task 10: Extract `useWeekPopulator` hook

**Files:**
- Create: `src/hooks/useWeekPopulator.ts`
- Modify: `src/screens/Workout.tsx` — use the new hook
- Modify: `src/hooks/index.ts` — add export

**Step 1: Create useWeekPopulator.ts**

Move `handlePopulateWeek` and `populateWeek` from Workout.tsx into this hook. The hook takes `program`, `weeklyPlan`, `selectedDate`, `updateDayPlan`, `setWorkoutLog` as parameters (or receives them via a config object).

```typescript
// src/hooks/useWeekPopulator.ts
// Extracts the ~100 lines of populate logic from Workout.tsx
// Returns { handlePopulateWeek }
```

**Step 2: Use in Workout.tsx**

Replace the inline functions with the hook call:

```typescript
const { handlePopulateWeek } = useWeekPopulator({
  program,
  weeklyPlan,
  selectedDate,
  updateDayPlan,
  setWorkoutLog,
});
```

**Step 3: Commit**

```bash
git add src/hooks/useWeekPopulator.ts src/screens/Workout.tsx src/hooks/index.ts
git commit -m "refactor: extract useWeekPopulator from Workout screen

Moves 100+ lines of week population logic into dedicated hook.
Screen component is now pure composition with no business logic."
```

---

### Task 11: Final cleanup and unused import removal

**Files:**
- Modify: `src/services/workoutStorage.service.ts` — remove now-unused `findLastExerciseOccurrence` (replaced by `findExerciseHistory`)
- Modify: `src/components/TemplateManager.tsx` — replace `ActionSheetIOS` with cross-platform Alert for options menu
- Modify: `src/components/workout/ChangeDayModal.tsx` — use theme colors instead of hardcoded white/gray
- Verify: no remaining `Alert.prompt` calls in the codebase
- Verify: no unused imports across modified files

**Step 1: Remove findLastExerciseOccurrence**

Delete the function from `workoutStorage.service.ts` (replaced by `findExerciseHistory` in Task 4).

**Step 2: Fix TemplateManager ActionSheetIOS**

Replace `ActionSheetIOS.showActionSheetWithOptions` with `Alert.alert` with buttons (Rename, Delete, Cancel) — works cross-platform.

**Step 3: Theme ChangeDayModal**

Replace hardcoded `backgroundColor: 'white'`, `color: '#999'`, etc. with `colors.cardBackground`, `colors.textSecondary`, etc.

**Step 4: Verify no Alert.prompt remaining**

```bash
grep -r "Alert.prompt" src/
```

Expected: no results.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: final cleanup

Remove dead findLastExerciseOccurrence, make TemplateManager
cross-platform, theme ChangeDayModal, verify no Alert.prompt usage."
```

---

## Task Dependency Order

```
Task 1  (dead code cleanup)
  └→ Task 2  (extract useWorkoutLog)
       └→ Task 3  (program exercise CRUD)
            └→ Task 6  (ProgramEditor modal)
                 └→ Task 7  (wire into screen)
  └→ Task 4  (exercise history modal + service)
       └→ Task 5  (wire into exercise rows)
  └→ Task 8  (calendar red/blue)
  └→ Task 9  (empty state fix)
  └→ Task 10 (extract useWeekPopulator)
       └→ Task 11 (final cleanup)
```

Tasks 4, 8, 9 can run in parallel after Task 1. Tasks 6-7 depend on Task 3. Task 11 is last.
