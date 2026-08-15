import React from 'react';
import { View, Text } from 'react-native';

export const MenuScreen = () => {
  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-2">Menu</Text>
      <Text className="text-gray-500">Settings, Profile, etc.</Text>
    </View>
  );
};
