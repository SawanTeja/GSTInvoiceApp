import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Rect, Circle, Polyline, Line } from 'react-native-svg';
import type { RootTabParamList } from './types';

import { HomeScreen } from '../screens/home/HomeScreen';
import { SalesStack } from './SalesStack';
import { EstimateScreen } from '../screens/estimate/EstimateScreen';
import { MenuScreen } from '../screens/menu/MenuScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

// SVG Icons
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

const SalesIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="20" x2="12" y2="10" />
    <Line x1="18" y1="20" x2="18" y2="4" />
    <Line x1="6" y1="20" x2="6" y2="16" />
  </Svg>
);

const EstimateIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const MenuIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="3" y1="12" x2="21" y2="12" />
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Line x1="3" y1="18" x2="21" y2="18" />
  </Svg>
);

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb', // blue-600
        tabBarInactiveTintColor: '#6b7280', // gray-500
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="SalesStack" 
        component={SalesStack} 
        options={{ 
          title: 'Sales',
          tabBarIcon: ({ color, size }) => <SalesIcon color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Estimate" 
        component={EstimateScreen} 
        options={{ 
          title: 'Estimate',
          tabBarIcon: ({ color, size }) => <EstimateIcon color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Menu" 
        component={MenuScreen} 
        options={{ 
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <MenuIcon color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
};
