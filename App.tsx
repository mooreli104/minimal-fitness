import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { DateProvider } from '@/context/DateContext';
import { TimerProvider, useTimer } from './src/context/TimerContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import TabNavigator from './src/navigation/TabNavigator';
import { TimerCompleteModal } from './src/components/workout/TimerCompleteModal';
import { foodsRepository } from './src/repositories/foodsRepository';

function AppContent() {
  const { theme, colors } = useTheme();
  const { showCompleteModal, closeCompleteModal, restartFromComplete } = useTimer();
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await foodsRepository.init();
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Continue anyway - app can function without food database
        setIsDbReady(true);
      }
    };

    initializeDatabase();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <TabNavigator />
        <TimerCompleteModal
          isVisible={showCompleteModal}
          onClose={closeCompleteModal}
          onRestart={restartFromComplete}
        />
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
