import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootTabParamList } from '../../navigation/types';

type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Menu'>;

export const MenuScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { title: 'Home', route: 'Home' as const, icon: '🏠' },
    { title: 'Sales', route: 'SalesStack' as const, icon: '📈' },
    { title: 'Estimate', route: 'Estimate' as const, icon: '⏱️' },
    { title: 'Menu', route: 'Menu' as const, icon: '⚙️' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingTop: insets.top }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Menu</Text>
      </View>

      <View style={s.listCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            onPress={() => navigation.navigate(item.route as any)}
            style={[s.menuItem, index !== menuItems.length - 1 && s.menuItemBorder]}
          >
            <View style={s.iconBox}>
              <Text style={s.iconText}>{item.icon}</Text>
            </View>
            <Text style={s.menuTitle}>{item.title}</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  header: { marginBottom: 24, marginTop: 16 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1f2937' },
  listCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden', elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  iconBox: { width: 40, height: 40, backgroundColor: '#eff6ff', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  iconText: { fontSize: 20 },
  menuTitle: { fontSize: 16, fontWeight: '500', color: '#1f2937', flex: 1 },
  chevron: { color: '#9ca3af', fontWeight: '700', fontSize: 20 },
});
