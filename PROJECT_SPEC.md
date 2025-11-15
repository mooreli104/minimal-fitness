# Minimal Fitness - MVP Specification

## Product Overview

A beautifully minimal calorie and workout tracker that runs 100% offline. Built for users who want simplicity over complexity.

---

## V1 vs V2 Feature Scope

### V1 (Weekend MVP) ✅
- Add food entries (name + calories)
- Add workout entries (name + sets/reps OR duration)
- View today's calorie total
- Simple scrollable history for food
- Simple scrollable history for workouts
- Delete entries
- Local data persistence (AsyncStorage)
- Date-based organization

### V2 (Future)
- Weekly calorie totals
- Weekly workout summaries
- Search/filter history
- Quick-add favorites
- Edit entries
- Dark mode toggle
- Export data

---

## Screen Structure

### Navigation: Bottom Tabs (2 tabs)
1. **Food** (fork icon)
2. **Workouts** (dumbbell icon)

### Screen Breakdown

#### 1. Food Screen
- **Top section**: Today's total calories (large, centered)
- **Middle**: "Add Food" button (prominent)
- **Bottom**: Scrollable list of today's food entries
- **Below**: Expandable "Previous Days" section (collapsible)

#### 2. Workout Screen
- **Top section**: Today's workout count (e.g., "3 exercises")
- **Middle**: "Add Workout" button (prominent)
- **Bottom**: Scrollable list of today's workouts
- **Below**: Expandable "Previous Days" section (collapsible)

#### 3. Add Food Modal (Bottom Sheet)
- Text input: Food name
- Number input: Calories
- Buttons: Cancel (gray) / Save (black)

#### 4. Add Workout Modal (Bottom Sheet)
- Text input: Exercise name
- Toggle: "Sets/Reps" vs "Duration"
- **If Sets/Reps**: Two number inputs (sets, reps)
- **If Duration**: Number input + unit picker (min/sec)
- Buttons: Cancel (gray) / Save (black)

---

## Data Models

### Food Entry
```json
{
  "id": "uuid-string",
  "name": "Chicken Breast",
  "calories": 230,
  "timestamp": "2025-11-15T14:30:00Z",
  "date": "2025-11-15"
}
```

### Workout Entry
```json
{
  "id": "uuid-string",
  "name": "Push-ups",
  "type": "sets_reps", // or "duration"
  "sets": 3,
  "reps": 15,
  "duration": null, // or { value: 30, unit: "min" }
  "timestamp": "2025-11-15T15:00:00Z",
  "date": "2025-11-15"
}
```

### Local Storage Structure
```json
{
  "foodEntries": [...],
  "workoutEntries": [...]
}
```

---

## Pseudocode

### Add Food Entry
```
function addFood(name, calories):
  entry = {
    id: generateUUID(),
    name: name,
    calories: calories,
    timestamp: getCurrentTimestamp(),
    date: getCurrentDate()
  }

  foodEntries = loadFromStorage("foodEntries") || []
  foodEntries.push(entry)
  saveToStorage("foodEntries", foodEntries)

  return entry
```

### Calculate Daily Total Calories
```
function getDailyTotal(date):
  foodEntries = loadFromStorage("foodEntries") || []
  todayEntries = foodEntries.filter(entry => entry.date === date)
  total = todayEntries.reduce((sum, entry) => sum + entry.calories, 0)
  return total
```

### Add Workout Entry
```
function addWorkout(name, type, data):
  entry = {
    id: generateUUID(),
    name: name,
    type: type,
    sets: type === "sets_reps" ? data.sets : null,
    reps: type === "sets_reps" ? data.reps : null,
    duration: type === "duration" ? data.duration : null,
    timestamp: getCurrentTimestamp(),
    date: getCurrentDate()
  }

  workoutEntries = loadFromStorage("workoutEntries") || []
  workoutEntries.push(entry)
  saveToStorage("workoutEntries", workoutEntries)

  return entry
```

### Delete Entry
```
function deleteEntry(id, entryType):
  entries = loadFromStorage(entryType) || []
  filtered = entries.filter(entry => entry.id !== id)
  saveToStorage(entryType, filtered)
```

### Group Entries by Date
```
function groupByDate(entries):
  grouped = {}

  entries.forEach(entry => {
    if (!grouped[entry.date]) {
      grouped[entry.date] = []
    }
    grouped[entry.date].push(entry)
  })

  return grouped
```

---

## Recommended Stack

### Core
- **Framework**: Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation (bottom tabs)

### Styling
- **Primary**: React Native StyleSheet (no external styling library)
- **Fonts**: System defaults (SF Pro on iOS, Roboto on Android)

### Storage
- **Local Data**: `@react-native-async-storage/async-storage`

### Icons
- **Icons**: `@expo/vector-icons` (Ionicons)

### Utilities
- **UUID**: `expo-crypto.randomUUID()`
- **Date handling**: Native JavaScript `Date` (no libraries needed)

### Modals
- **Modals**: React Native Modal component (built-in)

---

## UI Design System

### Color Palette
```
Background: #FFFFFF
Surface: #F9FAFB (light gray)
Border: #E5E7EB (subtle gray)
Text Primary: #111827 (near black)
Text Secondary: #6B7280 (medium gray)
Accent: #000000 (pure black for buttons)
Error: #DC2626 (only for delete actions)
```

### Typography
```
Title: 32px, weight 700 (daily totals)
Heading: 20px, weight 600 (section headers)
Body: 16px, weight 400 (entry names)
Caption: 14px, weight 400 (secondary info)
Button: 16px, weight 600
```

### Spacing Scale
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
```

### Component Styles

#### Button (Primary)
```
Background: #000000
Text: #FFFFFF
Height: 48px
Border radius: 12px
Padding: 16px horizontal
Font: 16px, weight 600
Shadow: subtle (0 2px 8px rgba(0,0,0,0.08))
```

#### Button (Secondary/Cancel)
```
Background: #F3F4F6
Text: #374151
Height: 48px
Border radius: 12px
Padding: 16px horizontal
Font: 16px, weight 600
```

#### Text Input
```
Background: #F9FAFB
Border: 1px solid #E5E7EB
Border radius: 10px
Height: 48px
Padding: 12px horizontal
Font: 16px, weight 400
Focus border: #000000
```

#### Food/Workout Entry Card
```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border radius: 12px
Padding: 16px
Margin: 8px vertical
Shadow: 0 1px 3px rgba(0,0,0,0.05)

Layout:
- Entry name (left, bold)
- Calories/details (right, gray)
- Swipe left to reveal delete
```

#### Bottom Tab Bar
```
Background: #FFFFFF
Border top: 1px solid #E5E7EB
Height: 64px
Active icon: #000000
Inactive icon: #9CA3AF
Label: 12px, weight 500
```

#### Daily Total Display
```
Container:
  Background: #F9FAFB
  Border radius: 16px
  Padding: 24px
  Margin: 16px horizontal

Number:
  Font: 48px, weight 700
  Color: #000000

Label:
  Font: 14px, weight 500
  Color: #6B7280
  Text: "calories today" or "workouts today"
```

#### Modal/Bottom Sheet
```
Background: #FFFFFF
Border radius: 20px (top corners only)
Padding: 24px
Max height: 80% of screen
Handle (drag indicator): 4px height, 40px width, #E5E7EB
```

---

## 48-Hour Build Plan

### Day 1: Foundation & Layout (8-10 hours)

#### Phase 1: Setup (2 hours)
- [ ] Initialize Expo project with TypeScript: `npx create-expo-app minimal-fitness --template blank-typescript`
- [ ] Install dependencies:
  ```bash
  npm install @react-navigation/native @react-navigation/bottom-tabs
  npx expo install react-native-screens react-native-safe-area-context
  npx expo install @react-native-async-storage/async-storage
  npx expo install expo-crypto
  ```
- [ ] Set up project structure:
  ```
  minimal-fitness/
  ├── src/
  │   ├── screens/
  │   │   ├── FoodScreen.tsx
  │   │   └── WorkoutsScreen.tsx
  │   ├── components/
  │   │   ├── DailyTotal.tsx
  │   │   ├── FoodEntry.tsx
  │   │   ├── WorkoutEntry.tsx
  │   │   ├── AddFoodModal.tsx
  │   │   └── AddWorkoutModal.tsx
  │   ├── navigation/
  │   │   └── TabNavigator.tsx
  │   ├── utils/
  │   │   ├── storage.ts
  │   │   └── dates.ts
  │   ├── types/
  │   │   └── index.ts
  │   └── styles/
  │       └── theme.ts
  ├── App.tsx
  └── package.json
  ```

#### Phase 2: Navigation & Screens (2 hours)
- [ ] Create theme.ts with all colors, spacing, typography constants
- [ ] Set up TabNavigator.tsx with React Navigation bottom tabs
- [ ] Create FoodScreen.tsx skeleton with SafeAreaView
- [ ] Create WorkoutsScreen.tsx skeleton with SafeAreaView
- [ ] Add tab icons (Ionicons: "restaurant" for food, "barbell" for workouts)
- [ ] Style tab bar (black active, gray inactive, white background)
- [ ] Update App.tsx to render TabNavigator

#### Phase 3: UI Components (4 hours)
- [ ] Build DailyTotal.tsx component (large number + label in gray container)
- [ ] Build FoodEntry.tsx card component (name left, calories right, with delete button)
- [ ] Build WorkoutEntry.tsx card component (name left, sets/reps or duration right)
- [ ] Build AddFoodModal.tsx:
  - Modal with visible={boolean} and onClose
  - TextInput for food name
  - TextInput for calories (numeric keyboard)
  - Cancel (gray) and Save (black) buttons
- [ ] Build AddWorkoutModal.tsx:
  - Toggle for "Sets/Reps" vs "Duration"
  - Conditional inputs based on toggle
  - Cancel and Save buttons
- [ ] Test all components with mock data in screens

---

### Day 2: Functionality & Polish (8-10 hours)

#### Phase 4: Data Layer (3 hours)
- [ ] Create types/index.ts with FoodEntry, WorkoutEntry interfaces
- [ ] Create utils/dates.ts with getTodayDate() and formatDate() functions
- [ ] Create utils/storage.ts:
  - loadFoodEntries() and saveFoodEntries()
  - loadWorkoutEntries() and saveWorkoutEntries()
  - addFoodEntry(name, calories)
  - addWorkoutEntry(name, type, data)
  - deleteFoodEntry(id)
  - deleteWorkoutEntry(id)
  - getDailyCalories(date)
  - getWorkoutCount(date)
  - groupEntriesByDate(entries)
- [ ] Test storage with console.logs in App.tsx

#### Phase 5: Connect UI to Data (3 hours)
- [ ] FoodScreen:
  - Load entries on mount with useState + useEffect
  - Pass data to DailyTotal (daily calories)
  - Render FlatList of today's FoodEntry components
  - Wire up AddFoodModal save button to call addFoodEntry()
  - Wire up delete on FoodEntry components
  - Refresh list after add/delete
- [ ] WorkoutsScreen:
  - Same pattern as FoodScreen
  - Show workout count in DailyTotal
  - Render today's WorkoutEntry components
  - Wire up AddWorkoutModal
- [ ] Add "Previous Days" section with collapsible/expandable state
- [ ] Test full add → display → delete flow on both screens

#### Phase 6: Polish & Testing (2-4 hours)
- [ ] Add empty states ("No food logged yet" / "No workouts yet")
- [ ] Add form validation:
  - Disable Save button if name is empty
  - Disable Save button if calories/sets/reps/duration is 0 or empty
- [ ] Add KeyboardAvoidingView to modals
- [ ] Verify all spacing matches spec (use theme constants)
- [ ] Verify all typography matches spec (fontSize, fontWeight)
- [ ] Test on iOS simulator (npx expo run:ios or Expo Go)
- [ ] Test on Android emulator (npx expo run:android or Expo Go)
- [ ] Test keyboard behavior on both platforms
- [ ] Test delete functionality
- [ ] Test data persistence (close/reopen app)

#### Phase 7: Deploy (30 min)
- [ ] Update app.json with proper name and version
- [ ] Create app icon (512x512 PNG, minimal black design on white)
- [ ] Test final build on physical device via Expo Go (npx expo start)
- [ ] Optional: Run `eas build` for production builds (requires EAS account)

---

## Key Implementation Notes

### Delete Button
Use a simple TouchableOpacity delete button (trash icon) on each entry card. No swipe gestures needed for V1.

### Collapsible Previous Days
Use simple state toggle with conditional rendering:
```typescript
const [showPrevious, setShowPrevious] = useState(false);
```

### Modals
Use React Native's built-in `Modal` component with `animationType="slide"` and `presentationStyle="pageSheet"` for iOS.

### Date Handling
```typescript
// Get today's date string
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Format display date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
```

### AsyncStorage Pattern
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const FOOD_KEY = '@foodEntries';
const WORKOUT_KEY = '@workoutEntries';

export const saveFood = async (entries: FoodEntry[]) => {
  await AsyncStorage.setItem(FOOD_KEY, JSON.stringify(entries));
};

export const loadFood = async (): Promise<FoodEntry[]> => {
  const data = await AsyncStorage.getItem(FOOD_KEY);
  return data ? JSON.parse(data) : [];
};
```

---

## Success Criteria

✅ App runs offline on iOS and Android
✅ Can add/delete food entries
✅ Can add/delete workout entries
✅ Daily calorie total calculates correctly
✅ History shows previous days
✅ UI feels premium (proper spacing, shadows, typography)
✅ No crashes or bugs
✅ Build completes in <48 hours
✅ Publishable on Expo

---

## What This Spec Gives You

1. **Clear scope**: Only essentials, no feature creep
2. **Exact UI rules**: Spacing, colors, fonts defined
3. **Data structure**: JSON schemas ready to implement
4. **Logic defined**: Pseudocode for all core functions
5. **Build timeline**: Hour-by-hour plan
6. **Tech stack**: Minimal, proven tools
7. **Design system**: Copy-paste ready values

## Quick Start Commands

```bash
# 1. Create project (if not already done)
npx create-expo-app minimal-fitness --template blank-typescript

# 2. Navigate to project
cd minimal-fitness

# 3. Install all dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npx expo install expo-crypto

# 4. Start development server
npx expo start

# 5. Run on iOS (requires macOS)
npx expo start --ios

# 6. Run on Android
npx expo start --android
```

## Project Structure to Create

```
minimal-fitness/
├── src/
│   ├── screens/
│   │   ├── FoodScreen.tsx
│   │   └── WorkoutsScreen.tsx
│   ├── components/
│   │   ├── DailyTotal.tsx
│   │   ├── FoodEntry.tsx
│   │   ├── WorkoutEntry.tsx
│   │   ├── AddFoodModal.tsx
│   │   └── AddWorkoutModal.tsx
│   ├── navigation/
│   │   └── TabNavigator.tsx
│   ├── utils/
│   │   ├── storage.ts
│   │   └── dates.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── theme.ts
├── App.tsx
└── package.json
```

Now follow the 48-Hour Build Plan starting with Day 1, Phase 1.
