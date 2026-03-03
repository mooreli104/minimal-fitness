# Workout Screen Redesign + Refactor

## Goals

1. Program editor: Full-screen modal for creating/editing workout programs with days and exercises
2. Exercise history: Tap-to-view modal showing past performance for any exercise
3. Calendar accountability: Unlogged past days show red; rest days show distinct blue/gray
4. Refactor: SOLID principles, dead code removal, DRY, cross-platform compatibility

## 1. Program Editor Modal

Replaces: `Alert.prompt` (iOS-only), `WorkoutDayActionSheet`, inability to edit program exercises.

### UI

- Full-screen modal (same pattern as `TemplateManager`)
- Each workout day is a collapsible card showing exercises (name + target only)
- Per-day `[···]` menu: Rename, Duplicate, Toggle Rest, Delete
- Drag handle for reordering days
- Swipe-to-delete on exercises within each day
- Cross-platform text inputs for all naming (replaces `Alert.prompt`)
- Footer buttons: `[+ Add Workout Day]` and `[+ Add Rest Day]`

### Behavior

- Edits modify the program (`@workoutProgram` in AsyncStorage)
- When a day pill is pressed on the main screen, it deep-copies from the updated program into the daily log (unchanged from current behavior)
- Program editor is opened from the workout header (replaces or sits alongside "Templates" button)

### New Files

- `src/components/workout/ProgramEditor.tsx` — main modal component
- `src/components/workout/ProgramDayCard.tsx` — collapsible day card with exercises

### Modified Files

- `src/screens/Workout.tsx` — add ProgramEditor modal trigger
- `src/hooks/useWorkoutProgram.ts` — add reorderDays, addExerciseToDay, removeExerciseFromDay, updateExerciseInDay

### Removed Files

- `src/components/WorkoutDayActionSheet.tsx` — replaced by per-day menu in program editor
- `src/styles/WorkoutDayActionSheet.styles.ts`

## 2. Exercise History Modal

### Trigger

Tap an exercise name in the workout table when the name field has content. An info/history icon appears beside populated exercise names.

### UI

- Center modal (like WorkoutCalendarModal)
- Title: exercise name
- Scrollable list of past occurrences, each showing:
  - Date (formatted)
  - Workout day name
  - Target, Actual, Weight

### Data

- Extends `findLastExerciseOccurrence` pattern to return an array of all matches within 90 days
- New service function: `findExerciseHistory(exerciseName, beforeDate, maxDaysBack): Promise<ExerciseHistoryEntry[]>`

### New Files

- `src/components/workout/ExerciseHistoryModal.tsx`

### Modified Files

- `src/services/workoutStorage.service.ts` — add `findExerciseHistory`
- `src/components/workout/ExerciseRow.tsx` — add tap handler on exercise name
- `src/screens/Workout.tsx` — add history modal state

## 3. Calendar Status Changes

### Status Mapping

| Condition | Color |
|-----------|-------|
| Complete workout | `${colors.green}40` |
| Incomplete workout | `${colors.red}40` |
| Explicit rest day | `${colors.blue}40` (new — distinct from green) |
| No log, past day | `${colors.red}40` |
| No log, future day | No color |

### Modified Files

- `src/components/workout/WorkoutCalendarModal.tsx` — update status logic for null logs on past days, add blue for rest
- `src/context/ThemeContext.tsx` — ensure `colors.blue` exists in both themes (if not already)

### Empty State Fix

`WorkoutContent.tsx` currently shows "Today is a rest day." for both `workoutLog === null` and `workoutLog.isRest === true`. Fix:
- `null` log → "Select a workout day above to start logging." (with day selector hint)
- `isRest === true` → "Rest day."

## 4. Refactor

### Dead Code Removal

| File | What | Why |
|------|------|-----|
| `src/components/workout/LoopingTimer.tsx` | Entire file | Never rendered, replaced by InlineLoopingTimer |
| `src/hooks/useWorkout.ts:14` | `findLastExerciseOccurrence` import | Currently unused (will be repurposed for history) |
| `src/utils/constants.ts` | `FOOD_LOG_PREFIX`, calorie/macro targets, `WEIGHT_ENTRIES` keys | Food features removed |
| `src/utils/constants.ts` | `CALORIE_TARGET`, `PROTEIN_TARGET`, etc. defaults | Food features removed |
| `src/utils/constants.ts` | `TOP_FOODS_LIMIT` | Food feature removed |
| `src/components/WorkoutDayActionSheet.tsx` + styles | Entire files | Replaced by program editor menu |

### Single Responsibility

1. **Extract `useWeekPopulator` hook** from `Workout.tsx` — moves `handlePopulateWeek` and `populateWeek` (100+ lines) out of the screen component
2. **Split `useWorkout` into `useWorkoutLog`** — daily log CRUD only. Screen composes `useWorkoutLog`, `useWorkoutProgram`, `useWorkoutTemplates` directly
3. **Extract `confirmAction` utility** — replaces 6+ identical `Alert.alert(title, msg, [Cancel, Confirm])` patterns

### DRY

1. **Style memoization** — `getWorkoutStyles(colors)` called in every component. Either memoize with `useMemo` in each, or provide via context
2. **`updateLog` helper** — the pattern "map/filter exercises → spread log → save" is repeated 3 times in the log hook. Extract a single `mutateLog(transform: (log) => log)` function

### Readability

1. Replace `JSON.parse(JSON.stringify(dayToLog))` with `structuredClone(dayToLog)`
2. Replace `generateId() + 1` with `generateUniqueId()`
3. Replace all `Alert.prompt` calls with cross-platform modal inputs (covered by program editor)

### Constants Cleanup

Remove food-related entries from `STORAGE_KEYS`, `DEFAULTS`, and `UI` objects.
