# Quick Start Guide - Minimal Fitness App

## ✅ Conversion Complete!

Your web-based React code has been fully converted to a **React Native + TypeScript** mobile app.

---

## 🚀 Run the App

### Option 1: Start Development Server
```bash
npx expo start
```

Then:
- Press `i` for iOS simulator (macOS only)
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### Option 2: Direct Launch
```bash
# iOS (macOS only)
npx expo start --ios

# Android
npx expo start --android

# Web (for testing)
npx expo start --web
```

---

## 📱 What's Included

### Screens
1. **Welcome Screen** - Onboarding with "calibu" branding
2. **Dashboard Screen** - Main calorie tracker with chart
3. **Add Entry Screen** - Input calories/workout with custom keypad
4. **Stats Screen** - Statistics overview cards

### Components
- Custom StatusBar
- Bottom Navigation (custom tab bar)
- Calorie Chart (SVG line graph)
- Date Selector
- Numeric Keypad
- Entry Cards

---

## 🎨 Design System

All colors, spacing, and typography are in `src/styles/theme.ts`:

```typescript
import { colors, spacing, typography } from './src/styles/theme';
```

### Colors
- Black/White minimal aesthetic
- No bright colors (as requested)

### Spacing
- Consistent 4px base scale
- xs (4) → sm (8) → md (12) → lg (16) → xl (24) → xxl (32)

---

## 🔧 Tech Stack

- ✅ Expo 54
- ✅ React Native
- ✅ TypeScript (strict mode)
- ✅ React Navigation (bottom tabs)
- ✅ @expo/vector-icons (Ionicons)
- ✅ react-native-svg (for charts)
- ✅ AsyncStorage (installed, ready to use)

---

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # Screen components
├── navigation/       # React Navigation setup
├── styles/           # Theme & design system
└── types/            # TypeScript type definitions
```

---

## ✏️ Next Steps

### To Add Data Persistence
1. Uncomment AsyncStorage imports in screens
2. Connect save/load functions to state
3. Test on device

### To Customize
- Edit colors in `src/styles/theme.ts`
- Modify screens in `src/screens/`
- Add new components in `src/components/`

---

## 🐛 Common Issues

### Metro bundler cache issues?
```bash
npx expo start -c
```

### TypeScript errors?
```bash
npx tsc --noEmit
```

### Module not found?
```bash
rm -rf node_modules
npm install
```

---

## 📦 Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 🎯 Key Features

✅ Fully typed TypeScript (no `any`)
✅ iOS + Android compatible
✅ Minimal black/white design
✅ Custom components throughout
✅ Ready for data persistence
✅ Production-ready structure

---

## 🆘 Need Help?

Check these files:
- `CONVERSION_SUMMARY.md` - Full conversion details
- `PROJECT_SPEC.md` - Original product spec
- `package.json` - All dependencies

Happy coding! 🚀
