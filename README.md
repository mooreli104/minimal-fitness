# Calibu - Minimal Fitness Tracker

A beautifully minimal calorie and workout tracker built with React Native, TypeScript, and Expo.

## 🎯 Features

- ✅ Track calories and workouts
- ✅ Beautiful minimalist black/white design
- ✅ Interactive line charts
- ✅ Custom numeric keypad
- ✅ Date selector for weekly tracking
- ✅ Statistics overview
- ✅ Fully typed with TypeScript
- ✅ Works on iOS and Android

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- iOS Simulator (macOS) or Android Studio (for emulator)
- Expo Go app on your phone (optional, for testing on device)

### Installation

```bash
# Navigate to project directory
cd minimal-fitness

# Install dependencies (if not already installed)
npm install

# Start the development server
npx expo start
```

### Run on Device/Simulator

Choose one of the following options:

```bash
# iOS Simulator (macOS only)
npx expo start --ios

# Android Emulator
npx expo start --android

# Physical Device
# 1. Run: npx expo start
# 2. Scan QR code with Expo Go app (iOS) or Camera app (Android)
```

## 📁 Project Structure

```
minimal-fitness/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── StatusBar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── CalorieChart.tsx
│   │   ├── DateSelector.tsx
│   │   ├── EntryItem.tsx
│   │   └── Keypad.tsx
│   ├── screens/          # App screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── AddEntryScreen.tsx
│   │   └── StatsScreen.tsx
│   ├── navigation/       # React Navigation setup
│   │   └── TabNavigator.tsx
│   ├── styles/           # Design system
│   │   └── theme.ts
│   └── types/            # TypeScript types
│       └── index.ts
├── App.tsx              # App entry point
├── package.json
└── tsconfig.json
```

## 🎨 Design System

### Color Palette
- **Background**: `#FFFFFF`
- **Surface**: `#F9FAFB`
- **Accent**: `#000000` (pure black)
- **Text Primary**: `#111827`
- **Text Secondary**: `#6B7280`

### Typography
- **Title**: 48px, Bold
- **Heading**: 32px, Bold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **xxl**: 32px

## 🛠️ Tech Stack

- **Framework**: Expo SDK 54
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation 7
- **Icons**: Expo Vector Icons (Ionicons)
- **Charts**: react-native-svg
- **Storage**: AsyncStorage (ready to implement)

## 📱 Screens

1. **Welcome** - Onboarding screen with app branding
2. **Dashboard** - Main screen with calorie total, chart, and entry list
3. **Add Entry** - Input screen with numeric keypad
4. **Stats** - Statistics overview with weekly/monthly summaries

## 🔧 Development

### TypeScript

All components are fully typed with strict mode enabled:

```typescript
interface EntryItemProps {
  entry: Entry;
}

const EntryItem: React.FC<EntryItemProps> = ({ entry }) => {
  // fully type-safe
};
```

### Styling

Using React Native StyleSheet with theme constants:

```typescript
import { colors, spacing, typography } from '../styles/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
});
```

### Navigation

Type-safe navigation with React Navigation:

```typescript
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type NavigationProp = BottomTabNavigationProp<RootStackParamList>;
const navigation = useNavigation<NavigationProp>();

navigation.navigate('Dashboard');
```

## 📦 Dependencies

```json
{
  "@react-navigation/native": "^7.1.20",
  "@react-navigation/bottom-tabs": "^7.8.5",
  "@react-native-async-storage/async-storage": "2.2.0",
  "@expo/vector-icons": "latest",
  "react-native-svg": "latest",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.0",
  "expo-crypto": "~15.0.7",
  "expo": "~54.0.23",
  "react": "19.1.0",
  "react-native": "0.81.5"
}
```

## 🚧 Next Steps / Roadmap

- [ ] Connect to AsyncStorage for data persistence
- [ ] Add pull-to-refresh on Dashboard
- [ ] Implement delete/edit for entries
- [ ] Add period selector dropdown (today/week/month)
- [ ] Create actual form for adding custom entries
- [ ] Add smooth animations
- [ ] Add haptic feedback
- [ ] Design app icon and splash screen
- [ ] Build production version with EAS

## 🐛 Known Issues

None currently! The app is in working state.

## 📄 License

MIT

## 🙏 Credits

Converted from Base44-generated web code to React Native + TypeScript.

---

Made with ❤️ using React Native and Expo
