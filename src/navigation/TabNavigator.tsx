import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';
import Dashboard from '../screens/Dashboard';
import Heart from '../screens/Heart';
import FoodLog from '../screens/FoodLog';
import Welcome from '../screens/Welcome';
import Workout from '../screens/Workout';
import More from '../screens/More';

const Tab = createBottomTabNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar, we use custom BottomNav
      }}
      initialRouteName="Welcome"
    >
      <Tab.Screen name="Welcome" component={Welcome} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Heart" component={Heart} />
      <Tab.Screen name="FoodLog" component={FoodLog} />
      <Tab.Screen name="Workout" component={Workout} />
      <Tab.Screen name="More" component={More} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
