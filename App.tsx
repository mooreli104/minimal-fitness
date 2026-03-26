import 'react-native-gesture-handler';

import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DateProvider } from '@/context/DateContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import TabNavigator from './src/navigation/TabNavigator';

function AppContent() {
  const { theme } = useTheme();

  return (
    <GestureHandlerRootView style={appStyles.root}>
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
        <AppContent />
      </DateProvider>
    </ThemeProvider>
  );
}

const appStyles = StyleSheet.create({ root: { flex: 1 } });
