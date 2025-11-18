import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DateProvider } from '@/context/DateContext';
import { TimerProvider } from './src/context/TimerContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import TabNavigator from './src/navigation/TabNavigator';

function AppContent() {
  const { theme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <TabNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <DateProvider>
        <TimerProvider>
          <AppContent />
        </TimerProvider>
      </DateProvider>
    </ThemeProvider>
  );
}
