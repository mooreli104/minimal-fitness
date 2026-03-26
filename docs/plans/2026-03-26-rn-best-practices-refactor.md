# React Native Best Practices Refactor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the entire codebase to follow React Native 2025 best practices — eliminate inline styles, enforce strict typing, theme all modals, add safe area handling, remove dead code, and optimize render performance.

**Architecture:** Systematic file-by-file refactoring organized into 8 tasks. Each task targets a clear responsibility boundary: theme-aware modals, type safety, inline style extraction, safe area handling, dead code removal, performance optimization, navigation typing, and console.error cleanup. No functional changes — purely structural improvement.

**Tech Stack:** React Native 0.81 (New Architecture enabled), Expo 54, TypeScript (strict), react-native-safe-area-context, react-navigation v6

---

## File Map

| Task | Files Modified | Responsibility |
|------|---------------|----------------|
| 1 | `src/context/ThemeContext.tsx` | Add `link` color to ThemeColors |
| 2 | `src/components/workout/RenameDayModal.tsx`, `src/components/workout/WeekPlannerModal.tsx` | Theme all hardcoded modal colors |
| 3 | `src/components/common/RollingDigit.tsx`, `src/components/workout/WorkoutCalendarModal.tsx`, `src/screens/Stats.tsx` | Replace `any` with proper types |
| 4 | `src/components/common/DateHeader.tsx`, `src/components/workout/DaySelector.tsx`, `src/components/workout/ExerciseRow.tsx`, `App.tsx`, `src/components/TemplateManager.tsx`, `src/screens/Workout.tsx`, `src/components/workout/ProgramEditor.tsx`, `src/styles/Workout.styles.ts` | Extract inline styles to StyleSheet |
| 5 | `src/components/BottomNav.tsx`, `src/screens/More.tsx`, `src/screens/Stats.tsx`, `src/screens/Workout.tsx` | Safe area insets for screens and BottomNav |
| 6 | `src/components/workout/ChangeDayModal.tsx`, `src/types/food.ts` | Remove dead code |
| 7 | `src/components/BottomNav.tsx`, `src/navigation/TabNavigator.tsx` | Fix navigation `as never` with typed hooks |
| 8 | `src/context/ThemeContext.tsx`, `src/hooks/useWorkoutProgram.ts`, `src/hooks/useWorkoutTemplates.ts`, `src/hooks/useWeeklyPlan.ts`, `src/hooks/useWeekPopulator.ts`, `src/services/workoutStorage.service.ts` | Remove console.error statements |

---

### Task 1: Add `link` color to ThemeColors

**Files:**
- Modify: `src/context/ThemeContext.tsx`

Several components hardcode `#007AFF` for links/action buttons. Adding a semantic `link` color to the theme keeps the system extensible without scattering hex codes.

- [ ] **Step 1: Add `link` to ThemeColors interface**

In `src/context/ThemeContext.tsx`, add `link` to the `ThemeColors` interface after the `accent` field:

```typescript
// In ThemeColors interface, after accent:
  accent: string;
  link: string;
```

- [ ] **Step 2: Add `link` value to both palettes**

In `lightColors`:
```typescript
  accent: '#0A0A0A',
  link: '#007AFF',
```

In `darkColors`:
```typescript
  accent: '#FFFFFF',
  link: '#0A84FF',
```

(Dark mode uses Apple's dark-mode blue for better contrast on dark backgrounds.)

- [ ] **Step 3: Replace hardcoded `#007AFF` across the codebase**

Replace every hardcoded `#007AFF` with `colors.link`:

**`src/styles/Workout.styles.ts`** — 3 occurrences:
- `templateButton.color: '#007AFF'` → `color: colors.link`
- `restToggleText.color: '#007AFF'` → `color: colors.link`
- `planWeekButton.backgroundColor: '#007AFF'` → `backgroundColor: colors.link`

**`src/screens/More.tsx`** — 1 occurrence:
- `emailLink.color: '#007AFF'` → needs dynamic color. Change the static `emailLink` style to omit `color`, then apply it inline: `style={[styles.emailLink, { color: colors.link }]}`

**`src/components/workout/WorkoutCalendarModal.tsx`** — 1 occurrence:
- `calendarDayTextToday.color: '#007AFF'` → The `getStyles` function already receives `colors`, so change to `color: colors.link`

- [ ] **Step 4: Verify no remaining `#007AFF` in src/**

Run: `grep -r "#007AFF" src/`
Expected: No results (only `WeekPlannerModal` uses it but that will be themed in Task 2).

- [ ] **Step 5: Commit**

```bash
git add src/context/ThemeContext.tsx src/styles/Workout.styles.ts src/screens/More.tsx src/components/workout/WorkoutCalendarModal.tsx
git commit -m "refactor: add link color to theme, replace hardcoded #007AFF"
```

---

### Task 2: Theme the hardcoded modals

**Files:**
- Modify: `src/components/workout/RenameDayModal.tsx`
- Modify: `src/components/workout/WeekPlannerModal.tsx`

Both modals have fully hardcoded light-mode colors (white, black, #e5e5e5, #f8f8f8, etc.). Convert them to use the theme system.

- [ ] **Step 1: Theme RenameDayModal**

Rewrite `src/components/workout/RenameDayModal.tsx`. The component already imports `useTheme` (for keyboard appearance only). Use `colors` from the theme to generate dynamic styles:

```tsx
import React, { useMemo } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../context/ThemeContext';

interface RenameDayModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  newDayName: string;
  setNewDayName: (name: string) => void;
}

export const RenameDayModal = ({ isVisible, onClose, onSave, newDayName, setNewDayName }: RenameDayModalProps) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Rename Workout Day</Text>
          <TextInput
            style={styles.input}
            value={newDayName}
            onChangeText={setNewDayName}
            autoFocus
            placeholder="Enter new name"
            placeholderTextColor={colors.textTertiary}
            keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
```

- [ ] **Step 2: Theme WeekPlannerModal**

Rewrite `src/components/workout/WeekPlannerModal.tsx`. Both the parent modal and `DayPlannerRow` sub-component need theming. Add `useTheme` and convert the static `styles` to a `getStyles(colors)` function:

```tsx
import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { WorkoutDay, WeeklyPlan, DayOfWeek } from '../../types';
import { UI } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../context/ThemeContext';

interface WeekPlannerModalProps {
  isVisible: boolean;
  onClose: () => void;
  weeklyPlan: WeeklyPlan;
  programDays: WorkoutDay[];
  onUpdateDay: (dayOfWeek: DayOfWeek, workoutDayId: number | null) => void;
  onClearPlan: () => void;
  onPopulateWeek: () => void;
}

interface DayPlannerRowProps {
  dayOfWeek: DayOfWeek;
  selectedWorkoutId: number | null;
  programDays: WorkoutDay[];
  onSelect: (dayOfWeek: DayOfWeek, workoutDayId: number | null) => void;
  colors: ThemeColors;
}

const DayPlannerRow = ({ dayOfWeek, selectedWorkoutId, programDays, onSelect, colors }: DayPlannerRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedWorkout = programDays.find(day => day.id === selectedWorkoutId);
  const styles = useMemo(() => getStyles(colors), [colors]);

  const getDisplayText = () => {
    if (selectedWorkoutId === -1) return 'Rest Day';
    if (selectedWorkout) return selectedWorkout.name;
    return 'Not Planned';
  };

  return (
    <View style={styles.dayRow}>
      <TouchableOpacity
        style={styles.dayHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.dayName}>{dayOfWeek}</Text>
        <Text style={styles.selectedWorkout}>{getDisplayText()}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.workoutOptions}>
          <TouchableOpacity
            style={[styles.workoutOption, selectedWorkoutId === -1 && styles.workoutOptionSelected]}
            onPress={() => { onSelect(dayOfWeek, -1); setIsExpanded(false); }}
          >
            <Text style={[styles.workoutOptionText, selectedWorkoutId === -1 && styles.workoutOptionTextSelected]}>
              Rest Day
            </Text>
          </TouchableOpacity>
          {programDays.filter(day => !day.isRest).map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[styles.workoutOption, selectedWorkoutId === day.id && styles.workoutOptionSelected]}
              onPress={() => { onSelect(dayOfWeek, day.id); setIsExpanded(false); }}
            >
              <Text style={[styles.workoutOptionText, selectedWorkoutId === day.id && styles.workoutOptionTextSelected]}>
                {day.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const WeekPlannerModal = ({
  isVisible,
  onClose,
  weeklyPlan,
  programDays,
  onUpdateDay,
  onClearPlan,
  onPopulateWeek,
}: WeekPlannerModalProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Calendar size={20} color={colors.textPrimary} />
              <Text style={styles.title}>{`Plan Your Week`}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.subtitle}>
              Assign a workout day to each day of the week
            </Text>
            <TouchableOpacity style={styles.populateButton} onPress={onPopulateWeek}>
              <Text style={styles.populateButtonText}>Auto-Populate Week</Text>
            </TouchableOpacity>
            {UI.WEEK_DAYS.map((day) => (
              <DayPlannerRow
                key={day}
                dayOfWeek={day as DayOfWeek}
                selectedWorkoutId={weeklyPlan[day]}
                programDays={programDays}
                onSelect={onUpdateDay}
                colors={colors}
              />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={onClearPlan}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: '100%',
    height: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 12,
  },
  populateButton: {
    backgroundColor: colors.green,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  populateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  dayRow: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectedWorkout: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  workoutOptions: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  workoutOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workoutOptionSelected: {
    backgroundColor: colors.link,
  },
  workoutOptionText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  workoutOptionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.link,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/components/workout/RenameDayModal.tsx src/components/workout/WeekPlannerModal.tsx
git commit -m "refactor: theme RenameDayModal and WeekPlannerModal for dark mode"
```

---

### Task 3: Eliminate `any` types

**Files:**
- Modify: `src/components/common/RollingDigit.tsx`
- Modify: `src/components/workout/WorkoutCalendarModal.tsx`
- Modify: `src/screens/Stats.tsx`

- [ ] **Step 1: Fix RollingDigit.tsx**

Replace `colors: any` with `ThemeColors`:

```tsx
// Change the import section and interface:
import { ThemeColors } from '../../context/ThemeContext';

interface RollingDigitProps {
  value: string;
  colors: ThemeColors;
}
```

- [ ] **Step 2: Fix WorkoutCalendarModal.tsx**

Replace `colors: any` in the `getStyles` function signature:

```typescript
// Change:
const getStyles = (colors: any) => StyleSheet.create({
// To:
const getStyles = (colors: ThemeColors) => StyleSheet.create({
```

Add the import at the top:
```typescript
import { useTheme, ThemeColors } from '../../context/ThemeContext';
```
(Replace the existing `import { useTheme } from '../../context/ThemeContext';`)

- [ ] **Step 3: Fix Stats.tsx logsCache ref type**

Replace the `any` in the logs cache ref:

```typescript
// Change:
const logsCache = React.useRef<Array<{ date: string; log: any }>>([]);
// To:
const logsCache = React.useRef<Array<{ date: string; log: WorkoutDay }>>([]);
```

Add the import:
```typescript
import { WorkoutDay } from '../types';
```

Also fix the exercise `find` callback that uses `any`:

```typescript
// Change (line ~128):
const match = log.exercises?.find(
  (ex: any) => ex.name.trim().toLowerCase() === selectedExercise.toLowerCase() && ex.weight
);
// To:
const match = log.exercises?.find(
  (ex) => ex.name.trim().toLowerCase() === selectedExercise.toLowerCase() && ex.weight
);
```

(TypeScript already infers the type from `log.exercises` which is `Exercise[]`.)

- [ ] **Step 4: Verify no remaining `any` in src/**

Run: `grep -rn ": any" src/ --include="*.ts" --include="*.tsx"`
Expected: No results.

- [ ] **Step 5: Commit**

```bash
git add src/components/common/RollingDigit.tsx src/components/workout/WorkoutCalendarModal.tsx src/screens/Stats.tsx
git commit -m "refactor: replace all any types with strict TypeScript types"
```

---

### Task 4: Extract inline styles to StyleSheet

**Files:**
- Modify: `App.tsx`
- Modify: `src/components/common/DateHeader.tsx`
- Modify: `src/components/workout/DaySelector.tsx`
- Modify: `src/components/TemplateManager.tsx`
- Modify: `src/screens/Workout.tsx`
- Modify: `src/components/workout/ProgramEditor.tsx`

Every `style={{ }}` object gets re-created on each render, causing unnecessary bridge serialization. Move them to StyleSheet.

- [ ] **Step 1: Fix App.tsx**

```tsx
// Change:
<GestureHandlerRootView style={{ flex: 1 }}>
// To:
<GestureHandlerRootView style={appStyles.root}>

// Add at bottom of file:
const appStyles = StyleSheet.create({
  root: { flex: 1 },
});
```

Add `StyleSheet` to the `react-native` import (it may not be imported yet — if not, add it: `import { StyleSheet } from 'react-native';`).

- [ ] **Step 2: Fix DateHeader.tsx**

```tsx
// Change:
<TouchableOpacity onPress={onPressDate} style={{ alignItems: 'center' }}>
// To:
<TouchableOpacity onPress={onPressDate} style={styles.datePressable}>

// Add to existing StyleSheet:
datePressable: {
  alignItems: 'center',
},
```

Also remove the unnecessary wrapper `<View>` around the date pressable (it adds nothing):

```tsx
// Change:
      <View>
        <TouchableOpacity onPress={onPressDate} style={styles.datePressable}>
          <Text style={[styles.dateHeaderText, { color: colors.textPrimary }]}>{formattedDate}</Text>
        </TouchableOpacity>
      </View>
// To:
      <TouchableOpacity onPress={onPressDate} style={styles.datePressable}>
        <Text style={[styles.dateHeaderText, { color: colors.textPrimary }]}>{formattedDate}</Text>
      </TouchableOpacity>
```

- [ ] **Step 3: Fix DaySelector.tsx**

```tsx
// Change:
contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
style={{ overflow: 'visible' }}
// To:
contentContainerStyle={styles.daySelectorScrollContent}
style={styles.daySelectorScroll}
```

Since DaySelector uses `getWorkoutStyles`, add these to `src/styles/Workout.styles.ts`:

```typescript
daySelectorScrollContent: {
  paddingHorizontal: 8,
  paddingVertical: 4,
},
daySelectorScroll: {
  overflow: 'visible',
},
```

- [ ] **Step 4: Fix TemplateManager.tsx inline styles**

The `TemplateCard` sub-component has inline styles on the rename TextInput:

```tsx
// Change:
style={[styles.cardTitle, { color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.accent, padding: 0 }]}
// To:
style={[styles.cardTitleEditing, { color: colors.textPrimary, borderBottomColor: colors.accent }]}
```

Add to the StyleSheet:
```typescript
cardTitleEditing: {
  fontSize: 17,
  fontWeight: '600',
  marginBottom: 4,
  borderBottomWidth: 1,
  padding: 0,
},
```

Also extract the `style={{ flex: 1 }}` on KeyboardAvoidingView:

```tsx
// Change:
style={{ flex: 1 }}
// To:
style={styles.flex}
```

Add to StyleSheet:
```typescript
flex: { flex: 1 },
```

And fix the `{{ opacity: 1 }}` on the options button (it does nothing — remove it):

```tsx
// Change:
<TouchableOpacity style={[styles.optionsButton, { opacity: 1 }]} onPress={onShowOptions}>
// To:
<TouchableOpacity style={styles.optionsButton} onPress={onShowOptions}>
```

- [ ] **Step 5: Fix Workout.tsx inline styles**

```tsx
// Change:
<GestureHandlerRootView style={{ flex: 1 }}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
// To:
<GestureHandlerRootView style={flexStyle.container}>
  <KeyboardAvoidingView
    style={flexStyle.container}
```

Add at bottom (outside the component, or import from a shared location):
```typescript
const flexStyle = StyleSheet.create({
  container: { flex: 1 },
});
```

Add `StyleSheet` to the react-native import.

- [ ] **Step 6: Fix ProgramEditor.tsx inline styles**

Same pattern — two `style={{ flex: 1 }}`:

```tsx
// Change both:
style={{ flex: 1 }}
// To:
style={styles.flex}
```

Add to existing StyleSheet:
```typescript
flex: { flex: 1 },
```

- [ ] **Step 7: Commit**

```bash
git add App.tsx src/components/common/DateHeader.tsx src/components/workout/DaySelector.tsx src/styles/Workout.styles.ts src/components/TemplateManager.tsx src/screens/Workout.tsx src/components/workout/ProgramEditor.tsx
git commit -m "refactor: extract all inline styles to StyleSheet.create blocks"
```

---

### Task 5: Safe area handling for screens and BottomNav

**Files:**
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/screens/More.tsx`
- Modify: `src/screens/Stats.tsx`
- Modify: `src/screens/Workout.tsx`

The `BottomNav` uses a hardcoded `paddingBottom: 24` as an approximation for the safe area. The three main screens don't account for notch/status bar insets. Fix both.

- [ ] **Step 1: Fix BottomNav to use safe area insets**

```tsx
// Add import:
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Inside the component:
const insets = useSafeAreaInsets();

// Change the container style:
<View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
```

Remove `paddingBottom: 24` from the `container` style in the StyleSheet (keep `paddingTop: 12`):

```typescript
container: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  borderTopWidth: 1,
  paddingTop: 12,
  paddingHorizontal: 24,
},
```

- [ ] **Step 2: Fix screen top insets**

Wrap the outer `<View>` of each screen with safe-area-aware padding for the status bar. Since each screen already has `BackgroundPattern` and `BottomNav`, the simplest approach is to use `useSafeAreaInsets` and apply `paddingTop`:

**`src/screens/Workout.tsx`:**
```tsx
// Add import:
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Inside component:
const insets = useSafeAreaInsets();

// The styles.content already has paddingTop: 48, which is the Workout.styles paddingTop.
// Replace the hardcoded paddingTop with dynamic safe area:
// In the ScrollView, override contentContainerStyle:
<ScrollView
  contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
  ...
```

**`src/screens/Stats.tsx`:**
```tsx
// Add import:
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Inside component:
const insets = useSafeAreaInsets();

// Change:
<ScrollView contentContainerStyle={s.content} ...>
// To:
<ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 16 }]} ...>
```

Then change the static `s.content` to remove the hardcoded paddingTop:
```typescript
content: { paddingHorizontal: 24 },
```

**`src/screens/More.tsx`:**
```tsx
// Add import:
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Inside component:
const insets = useSafeAreaInsets();

// The More screen centers content, so just add top padding to the container:
<View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BottomNav.tsx src/screens/More.tsx src/screens/Stats.tsx src/screens/Workout.tsx
git commit -m "refactor: replace hardcoded safe area values with useSafeAreaInsets"
```

---

### Task 6: Remove dead code

**Files:**
- Delete: `src/components/workout/ChangeDayModal.tsx`
- Delete: `src/types/food.ts`

- [ ] **Step 1: Verify ChangeDayModal is unused**

Run: `grep -r "ChangeDayModal" src/ --include="*.ts" --include="*.tsx"`
Expected: Only the file itself (`ChangeDayModal.tsx`). No imports from other files.

- [ ] **Step 2: Verify food.ts is unused**

Run: `grep -r "food" src/ --include="*.ts" --include="*.tsx"`
Expected: Only `food.ts` itself. No imports from other files.

- [ ] **Step 3: Delete both files**

```bash
rm src/components/workout/ChangeDayModal.tsx
rm src/types/food.ts
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused ChangeDayModal and food types"
```

---

### Task 7: Fix navigation type safety

**Files:**
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/navigation/TabNavigator.tsx`

The `as never` cast on `navigation.navigate()` suppresses type checking. Fix by using typed navigation hooks.

- [ ] **Step 1: Export typed navigation hook**

In `src/navigation/TabNavigator.tsx`, add a typed hook export:

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationProp, useNavigation as useRNNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import Workout from '../screens/Workout';
import Stats from '../screens/Stats';
import More from '../screens/More';

export type AppNavigationProp = NavigationProp<RootStackParamList>;

export const useAppNavigation = () => useRNNavigation<AppNavigationProp>();

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

Add `import React from 'react';` at the top if not already present.

- [ ] **Step 2: Use typed hook in BottomNav**

```tsx
// Change:
import { useNavigation, useRoute } from "@react-navigation/native";
// To:
import { useRoute } from "@react-navigation/native";
import { useAppNavigation } from "../navigation/TabNavigator";
import { ScreenName } from "../types";

// Change:
const navigation = useNavigation();
// To:
const navigation = useAppNavigation();

// Change navItems to use ScreenName type:
const navItems: Array<{ icon: typeof Dumbbell; route: ScreenName; name: string }> = [
  { icon: Dumbbell, route: 'Workout', name: 'workout' },
  { icon: BarChart2, route: 'Stats', name: 'stats' },
  { icon: Menu, route: 'More', name: 'more' },
];

// Change the navigate call:
onPress={() => navigation.navigate(item.route)}
```

This removes the `as never` cast entirely.

- [ ] **Step 3: Commit**

```bash
git add src/components/BottomNav.tsx src/navigation/TabNavigator.tsx
git commit -m "refactor: add typed navigation hooks, remove as-never cast"
```

---

### Task 8: Remove console.error statements

**Files:**
- Modify: `src/context/ThemeContext.tsx`
- Modify: `src/hooks/useWorkoutProgram.ts`
- Modify: `src/hooks/useWorkoutTemplates.ts`
- Modify: `src/hooks/useWeeklyPlan.ts`
- Modify: `src/hooks/useWeekPopulator.ts`
- Modify: `src/services/workoutStorage.service.ts`

All `console.error` calls in the production code are noise. Each location already has proper error handling (Alert.alert or try/catch with fallback). Remove them.

- [ ] **Step 1: Remove console.error from ThemeContext.tsx**

Remove the `console.error` lines (2 occurrences):
```typescript
// In loadTheme: Remove:
console.error('Failed to load theme:', error);
// In setTheme: Remove:
console.error('Failed to save theme:', error);
```

The try/catch blocks remain — they just silently fall through, which is correct (theme load failure shouldn't block the app).

- [ ] **Step 2: Remove console.error from hooks**

**`src/hooks/useWorkoutProgram.ts`** — Remove 2 occurrences:
- Line 18: `console.error('Workout program load error:', error);`
- Line 30: `console.error('Workout program save error:', error);`

**`src/hooks/useWorkoutTemplates.ts`** — Remove 2 occurrences. (Read this file first to find the exact lines, but it follows the same pattern as useWorkoutProgram.)

**`src/hooks/useWeeklyPlan.ts`** — Remove 3 occurrences:
- Line 25: `console.error('Weekly plan load error:', error);`
- Line 40: `console.error('Weekly plan update error:', error);`
- Line 59: `console.error('Weekly plan clear error:', error);`

**`src/hooks/useWeekPopulator.ts`** — Remove 1 occurrence. (Read to find exact line.)

- [ ] **Step 3: Remove console.error from workoutStorage.service.ts**

Remove 1 occurrence:
- Line 229: `console.error('Failed to delete exercise from logs:', error);`

The try/catch remains as-is (swallows the error silently, which is acceptable here since it's a bulk background operation).

- [ ] **Step 4: Verify no remaining console statements in src/**

Run: `grep -rn "console\." src/ --include="*.ts" --include="*.tsx"`
Expected: No results.

- [ ] **Step 5: Commit**

```bash
git add src/context/ThemeContext.tsx src/hooks/useWorkoutProgram.ts src/hooks/useWorkoutTemplates.ts src/hooks/useWeeklyPlan.ts src/hooks/useWeekPopulator.ts src/services/workoutStorage.service.ts
git commit -m "chore: remove console.error statements from production code"
```
