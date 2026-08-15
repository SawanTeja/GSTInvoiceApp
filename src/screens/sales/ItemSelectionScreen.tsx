import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const ItemSelectionScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-6">Item Selection</Text>
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="bg-gray-200 px-6 py-3 rounded-lg w-full items-center"
      >
        <Text className="text-gray-800 font-semibold">Done</Text>
      </TouchableOpacity>
    </View>
  );
};
