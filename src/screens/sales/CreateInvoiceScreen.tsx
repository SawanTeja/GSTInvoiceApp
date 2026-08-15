import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SalesStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'CreateInvoice'>;

export const CreateInvoiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-6">Create Invoice</Text>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('ItemSelection')}
        className="bg-blue-600 px-6 py-3 rounded-lg w-full items-center"
      >
        <Text className="text-white font-semibold">Add Items</Text>
      </TouchableOpacity>
    </View>
  );
};
