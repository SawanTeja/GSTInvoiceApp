import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../navigation/types';

type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Menu'>;

export const MenuScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const menuItems = [
    { title: 'Home', route: 'Home' as const, icon: '🏠' },
    { title: 'Sales', route: 'SalesStack' as const, icon: '📈' },
    { title: 'Estimate', route: 'Estimate' as const, icon: '⏱️' },
    { title: 'Menu', route: 'Menu' as const, icon: '⚙️' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mb-6 mt-4">
        <Text className="text-3xl font-bold text-gray-800">Menu</Text>
      </View>

      <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={item.title}
            onPress={() => navigation.navigate(item.route as any)}
            className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mr-4">
              <Text className="text-xl">{item.icon}</Text>
            </View>
            <Text className="text-lg font-medium text-gray-800 flex-1">{item.title}</Text>
            <Text className="text-gray-400 font-bold text-lg">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

