import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const EstimateScreen = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[s.container, { paddingTop: insets.top + 16 }]}>
      <Text style={s.icon}>⏱️</Text>
      <Text style={s.title}>Estimates</Text>
      <Text style={s.subtitle}>Coming Soon</Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: 16 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  subtitle: { color: '#6b7280', fontSize: 16 },
});
