import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DateProvider } from '@/context/DateContext';
import TabNavigator from './src/navigation/TabNavigator';

export default function App(): React.JSX.Element {
  return (
    <DateProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TabNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
    </DateProvider>
  );
}
