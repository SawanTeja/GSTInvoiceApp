import React from 'react';
import { createNativeStackNavigator } from '@react-native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};
