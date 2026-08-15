import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { SalesStackParamList, SelectedItem } from '../../navigation/types';
import { ITEMS } from '../../data/items';

type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'CreateInvoice'>;
type CreateInvoiceRouteProp = RouteProp<SalesStackParamList, 'CreateInvoice'>;

export const CreateInvoiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateInvoiceRouteProp>();
  
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    if (route.params?.selectedItems) {
      setSelectedItems(route.params.selectedItems);
    }
  }, [route.params?.selectedItems]);

  const goToAddItems = () => {
    navigation.navigate('ItemSelection', { initialSelectedItems: selectedItems });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Create Invoice</Text>
        
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Items</Text>
          
          {selectedItems.length === 0 ? (
            <Text className="text-gray-500 italic mb-4">No items added yet.</Text>
          ) : (
            <View className="mb-4">
              {selectedItems.map((si) => {
                const itemDetails = ITEMS.find(i => i.id === si.id);
                if (!itemDetails) return null;
                return (
                  <View key={si.id} className="flex-row justify-between py-2 border-b border-gray-100">
                    <View>
                      <Text className="font-medium text-gray-800">{itemDetails.name}</Text>
                      <Text className="text-sm text-gray-500">₹{itemDetails.price} x {si.quantity}</Text>
                    </View>
                    <Text className="font-semibold text-gray-800">
                      ₹{itemDetails.price * si.quantity}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity 
            onPress={goToAddItems}
            className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg items-center"
          >
            <Text className="text-blue-600 font-semibold">+ Add / Edit Items</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

