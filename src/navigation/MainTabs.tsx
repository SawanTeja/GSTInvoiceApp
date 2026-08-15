import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';

import { HomeScreen } from '../screens/home/HomeScreen';
import { SalesStack } from './SalesStack';
import { EstimateScreen } from '../screens/estimate/EstimateScreen';
import { MenuScreen } from '../screens/menu/MenuScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // We use stack headers mostly, or custom headers
        tabBarActiveTintColor: '#2563eb', // blue-600
        tabBarInactiveTintColor: '#6b7280', // gray-500
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }} 
      />
      <Tab.Screen 
        name="SalesStack" 
        component={SalesStack} 
        options={{ title: 'Sales' }} 
      />
      <Tab.Screen 
        name="Estimate" 
        component={EstimateScreen} 
        options={{ title: 'Estimate' }} 
      />
      <Tab.Screen 
        name="Menu" 
        component={MenuScreen} 
        options={{ title: 'Menu' }} 
      />
    </Tab.Navigator>
  );
};
