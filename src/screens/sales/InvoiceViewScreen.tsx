import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { SalesStackParamList } from '../../navigation/types';

type InvoiceViewRouteProp = RouteProp<SalesStackParamList, 'InvoiceView'>;

export const InvoiceViewScreen = () => {
  const route = useRoute<InvoiceViewRouteProp>();
  const navigation = useNavigation();
  const { invoiceId } = route.params;

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-2">Invoice Details</Text>
      <Text className="text-gray-600 mb-6">ID: {invoiceId}</Text>
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="bg-gray-200 px-6 py-3 rounded-lg w-full items-center"
      >
        <Text className="text-gray-800 font-semibold">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};
