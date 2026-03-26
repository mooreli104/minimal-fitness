import React from 'react';
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
