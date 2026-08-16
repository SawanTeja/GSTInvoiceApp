import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
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

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(
    initialSelectedItems.map(item => ({ ...item }))
  );

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

  const totalSelected = selectedItems.length;

  const renderItem = ({ item }: { item: CatalogItem }) => {
    const selectedItem = selectedItems.find(si => si.id === item.id);
    const isSelected = !!selectedItem;

    return (
      <View style={[s.itemRow, isSelected && s.itemRowSelected]}>
        <TouchableOpacity
          onPress={() => handleToggleSelect(item)}
          style={[s.checkbox, isSelected && s.checkboxSelected]}
        >
          {isSelected && <Text style={s.checkmark}>✓</Text>}
        </TouchableOpacity>

        <View style={s.itemInfo}>
          <Text style={s.itemName}>{item.name}</Text>
          <Text style={s.itemMeta}>₹{item.price.toLocaleString('en-IN')} / {item.unit} • GST: {item.gstRate}%</Text>
        </View>

        {isSelected && (
          <View style={s.qtyBox}>
            <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)} style={s.qtyBtn}>
              <Text style={s.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={s.qtyValue}>{selectedItem!.quantity}</Text>
            <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)} style={s.qtyBtn}>
              <Text style={s.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.hint}>
        <Text style={s.hintText}>
          Tap to select items, then adjust quantity. {totalSelected > 0 ? `${totalSelected} item(s) selected.` : ''}
        </Text>
      </View>

      <FlatList
        data={ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={s.bottomBar}>
        <TouchableOpacity
          onPress={handleAddItems}
          style={[s.addBtn, totalSelected === 0 && s.addBtnDisabled]}
          disabled={totalSelected === 0}
        >
          <Text style={s.addBtnText}>
            {totalSelected > 0
              ? `Add Selected Items (${totalSelected})`
              : 'Select at least 1 item'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hint: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  hintText: { color: '#6b7280', fontSize: 13 },
  itemRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  itemRowSelected: { backgroundColor: '#eff6ff' },
  checkbox: { width: 26, height: 26, borderRadius: 4, borderWidth: 2, borderColor: '#9ca3af', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  checkmark: { color: '#fff', fontWeight: '700', fontSize: 14 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  itemMeta: { color: '#6b7280', fontSize: 13, marginTop: 2 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff', marginLeft: 8 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#f3f4f6' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  qtyValue: { paddingHorizontal: 12, fontWeight: '600', minWidth: 32, textAlign: 'center', color: '#1f2937' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', elevation: 8 },
  addBtn: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  addBtnDisabled: { backgroundColor: '#9ca3af' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
