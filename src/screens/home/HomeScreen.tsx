import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HomeScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl font-bold text-blue-600">GST Invoice App</Text>
      <Text className="text-gray-500 mt-2">Setup Successful!</Text>
    </View>
  );
};
