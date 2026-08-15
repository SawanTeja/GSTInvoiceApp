import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SalesStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'SalesDashboard'>;

export const SalesDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-6">Sales Dashboard</Text>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('CreateInvoice')}
        className="bg-blue-600 px-6 py-3 rounded-lg mb-4 w-full items-center"
      >
        <Text className="text-white font-semibold">Create New Invoice</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate('InvoiceView', { invoiceId: 'test-123' })}
        className="bg-gray-200 px-6 py-3 rounded-lg w-full items-center"
      >
        <Text className="text-gray-800 font-semibold">View Test Invoice</Text>
      </TouchableOpacity>
    </View>
  );
};
