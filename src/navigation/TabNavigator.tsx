import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Dashboard from '../screens/Dashboard';
import Analytics from '../screens/Analytics';
import FoodLog from '../screens/FoodLog';
import Welcome from '../screens/Welcome';
import Workout from '../screens/Workout';
import More from '../screens/More';
import { FoodSearchScreen } from '../screens/FoodSearchScreen';

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator();

// Food Log Stack Navigator
const FoodLogStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="FoodLogMain" component={FoodLog} />
      <Stack.Screen
        name="FoodSearch"
        component={FoodSearchScreen}
        options={{
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
};

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
      <Tab.Screen name="Analytics" component={Analytics} />
      <Tab.Screen name="FoodLog" component={FoodLogStack} />
      <Tab.Screen name="Workout" component={Workout} />
      <Tab.Screen name="More" component={More} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
