import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';
import Dashboard from '../screens/Dashboard';
import AddEntry from '../screens/AddEntry';
import FoodLog from '../screens/FoodLog';
import Welcome from '../screens/Welcome';
import Workout from '../screens/Workout';
import Settings from '../screens/Settings';

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
      <Tab.Screen name="AddEntry" component={AddEntry} />
      <Tab.Screen name="FoodLog" component={FoodLog} />
      <Tab.Screen name="Workout" component={Workout} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
