import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { SalesStackParamList, SelectedItem } from '../../navigation/types';
import { ITEMS, CatalogItem } from '../../data/items';

type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'ItemSelection'>;
type ItemSelectionRouteProp = RouteProp<SalesStackParamList, 'ItemSelection'>;

export const ItemSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ItemSelectionRouteProp>();
  const { initialSelectedItems = [] } = route.params || {};

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(initialSelectedItems);

  const handleToggleSelect = (item: CatalogItem) => {
    const existing = selectedItems.find(si => si.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.filter(si => si.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, { id: item.id, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setSelectedItems(prev => prev.map(si => {
      if (si.id === itemId) {
        const newQuantity = Math.max(1, si.quantity + delta);
        return { ...si, quantity: newQuantity };
      }
      return si;
    }));
  };

  const handleAddItems = () => {
    navigation.navigate({
      name: 'CreateInvoice',
      params: { selectedItems },
      merge: true,
    });
  };

  const renderItem = ({ item }: { item: CatalogItem }) => {
    const selectedItem = selectedItems.find(si => si.id === item.id);
    const isSelected = !!selectedItem;

    return (
      <View className={`p-4 border-b border-gray-200 flex-row justify-between items-center ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
          <Text className="text-gray-500">₹{item.price} • GST: {item.gstRate}%</Text>
        </View>

        <View className="flex-row items-center space-x-3 gap-3">
          {isSelected ? (
            <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <TouchableOpacity 
                onPress={() => handleQuantityChange(item.id, -1)}
                className="px-3 py-1 bg-gray-100 active:bg-gray-200"
              >
                <Text className="text-lg font-bold text-gray-700">−</Text>
              </TouchableOpacity>
              <Text className="px-3 font-semibold min-w-[32px] text-center text-gray-800">
                {selectedItem.quantity}
              </Text>
              <TouchableOpacity 
                onPress={() => handleQuantityChange(item.id, 1)}
                className="px-3 py-1 bg-gray-100 active:bg-gray-200"
              >
                <Text className="text-lg font-bold text-gray-700">+</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity 
            onPress={() => handleToggleSelect(item)}
            className={`w-8 h-8 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}
          >
            {isSelected && <Text className="text-white font-bold text-lg">✓</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList 
        data={ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <TouchableOpacity 
          onPress={handleAddItems}
          className="bg-blue-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            Add Selected Items ({selectedItems.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
