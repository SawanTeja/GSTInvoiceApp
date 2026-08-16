import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SalesStackParamList } from '../../navigation/types';
import { selectInvoices, selectTotalSales, selectTotalTax, selectInvoiceCount } from '../../store/invoiceSlice';
import { Invoice } from '../../types/invoice';

type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'SalesDashboard'>;

const getInvoiceStatus = (invoice: Invoice): 'paid' | 'overdue' | 'unpaid' => {
  if (invoice.status === 'paid') return 'paid';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(invoice.dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) return 'overdue';
  return 'unpaid';
};

const statusConfig = {
  paid: { bg: '#dcfce7', color: '#15803d', label: 'Paid' },
  overdue: { bg: '#fee2e2', color: '#b91c1c', label: 'Overdue' },
  unpaid: { bg: '#fef9c3', color: '#a16207', label: 'Unpaid' },
};

const StatusBadge = ({ status }: { status: 'paid' | 'overdue' | 'unpaid' }) => {
  const cfg = statusConfig[status];
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

export const SalesDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const invoices = useSelector(selectInvoices);
  const totalSales = useSelector(selectTotalSales);
  const totalTax = useSelector(selectTotalTax);
  const invoiceCount = useSelector(selectInvoiceCount);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.trim().toLowerCase();
    return invoices.filter(inv =>
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.buyer.name.toLowerCase().includes(q) ||
      inv.seller.name.toLowerCase().includes(q) ||
      inv.totals.totalAmount.toString().includes(q)
    );
  }, [invoices, searchQuery]);

  const renderInvoiceItem = ({ item }: { item: Invoice }) => {
    const status = getInvoiceStatus(item);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('InvoiceView', { invoiceId: item.id })}
        style={s.invoiceRow}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={s.invoiceRowHeader}>
            <Text style={s.invoiceNumber}>{item.invoiceNumber}</Text>
            <StatusBadge status={status} />
          </View>
          <Text style={s.buyerName}>{item.buyer.name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.invoiceAmount}>₹{item.totals.totalAmount.toLocaleString('en-IN')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.row}>
        <View style={[s.card, s.flex1, { marginRight: 8 }]}>
          <Text style={s.cardLabel}>Total Invoices</Text>
          <Text style={s.cardValue}>{invoiceCount}</Text>
        </View>
        <View style={[s.card, s.flex1, { marginLeft: 8 }]}>
          <Text style={s.cardLabel}>Total Value</Text>
          <Text style={[s.cardValue, { color: '#2563eb' }]}>₹{totalSales.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={[s.card, { marginBottom: 16 }]}>
        <Text style={s.cardLabel}>Total Tax Collected</Text>
        <Text style={[s.cardValue, { fontSize: 20 }]}>₹{totalTax.toLocaleString('en-IN')}</Text>
      </View>

      <View style={s.searchBox}>
        <Text style={{ color: '#9ca3af', marginRight: 8 }}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search invoices..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: '#9ca3af', fontSize: 18, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.listHeader}>
        <Text style={s.listTitle}>
          {searchQuery ? `Results (${filteredInvoices.length})` : 'Recent Invoices'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateInvoice', {})} style={s.newBtn}>
          <Text style={s.newBtnText}>+ New Invoice</Text>
        </TouchableOpacity>
      </View>

      {invoices.length === 0 ? (
        <View style={s.emptyState}>
          <View style={s.emptyIcon}>
            <Text style={{ color: '#3b82f6', fontSize: 28 }}>📄</Text>
          </View>
          <Text style={s.emptyTitle}>No invoices yet</Text>
          <Text style={s.emptySubtitle}>Create your first invoice to get started</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateInvoice', {})} style={[s.newBtn, { paddingHorizontal: 24, paddingVertical: 12, marginTop: 12 }]}>
            <Text style={s.newBtnText}>Create Invoice</Text>
          </TouchableOpacity>
        </View>
      ) : filteredInvoices.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 28, marginBottom: 12 }}>🔍</Text>
          <Text style={s.emptyTitle}>No invoices found</Text>
          <Text style={s.emptySubtitle}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  row: { flexDirection: 'row', marginBottom: 12 },
  flex1: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', elevation: 1 },
  cardLabel: { color: '#6b7280', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  searchBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 12, color: '#1f2937', fontSize: 14 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  newBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  newBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  invoiceRow: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  invoiceRowHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  invoiceNumber: { fontWeight: '700', color: '#1f2937', fontSize: 15, marginRight: 8 },
  buyerName: { color: '#6b7280', fontSize: 14 },
  invoiceAmount: { fontWeight: '700', color: '#1d4ed8', fontSize: 17 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontWeight: '600', fontSize: 11 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyIcon: { width: 64, height: 64, backgroundColor: '#dbeafe', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { color: '#6b7280', fontSize: 18, fontWeight: '500', marginBottom: 4 },
  emptySubtitle: { color: '#9ca3af', fontSize: 14 },
});
