import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, Pressable, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SalesStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { deleteInvoice, selectInvoiceById, markAsPaid } from '../../store/invoiceSlice';
import { numberToWords } from '../../utils/numberToWords';

type InvoiceViewRouteProp = RouteProp<SalesStackParamList, 'InvoiceView'>;
type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'InvoiceView'>;

const getInvoiceStatus = (invoice: { status: string; dueDate: string }): 'paid' | 'overdue' | 'unpaid' => {
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

export const InvoiceViewScreen = () => {
  const route = useRoute<InvoiceViewRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { invoiceId } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);

  const invoice = useSelector((state: RootState) => selectInvoiceById(state, invoiceId));

  if (!invoice) {
    return (
      <View style={s.notFoundContainer}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
        <Text style={s.notFoundTitle}>Invoice Not Found</Text>
        <Text style={s.notFoundSub}>This invoice may have been deleted.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.goBackBtn}>
          <Text style={s.goBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayStatus = getInvoiceStatus(invoice);

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('CreateInvoice', { invoiceId: invoice.id });
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete invoice ${invoice.invoiceNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteInvoice(invoice.id));
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleMarkAsPaid = () => {
    dispatch(markAsPaid(invoice.id));
  };

  const isIntraState = invoice.totals.cgstAmount > 0 || invoice.totals.sgstAmount > 0;
  const isInterState = invoice.totals.igstAmount > 0;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerTitle}>{invoice.invoiceNumber}</Text>
          <View style={{ marginLeft: 12 }}>
            <StatusBadge status={displayStatus} />
          </View>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={s.menuBtn}>
          <Text style={s.menuBtnText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={s.menuCard}>
            <TouchableOpacity onPress={handleEdit} style={[s.menuItem, { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }]}>
              <Text style={{ marginRight: 12, fontSize: 16 }}>✏️</Text>
              <Text style={s.menuItemText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={s.menuItem}>
              <Text style={{ marginRight: 12, fontSize: 16 }}>🗑️</Text>
              <Text style={[s.menuItemText, { color: '#dc2626' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <View style={s.datesRow}>
            <View>
              <Text style={s.microLabel}>Invoice Date</Text>
              <Text style={s.dateValue}>{invoice.invoiceDate}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.microLabel}>Due Date</Text>
              <Text style={s.dateValue}>{invoice.dueDate}</Text>
            </View>
          </View>
          <View style={s.grandTotalHeader}>
            <Text style={s.microLabel}>Grand Total</Text>
            <Text style={s.grandTotalHeaderValue}>₹{invoice.totals.totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={s.partiesRow}>
          <View style={[s.card, s.partyCard, { marginRight: 8 }]}>
            <Text style={s.microLabel}>Billed By (Seller)</Text>
            <Text style={s.partyName}>{invoice.seller.name}</Text>
            <Text style={s.partyGst}>GST: {invoice.seller.gstin}</Text>
          </View>
          <View style={[s.card, s.partyCard, { marginLeft: 8 }]}>
            <Text style={s.microLabel}>Billed To (Buyer)</Text>
            <Text style={s.partyName}>{invoice.buyer.name}</Text>
            <Text style={s.partyGst}>GST: {invoice.buyer.gstin}</Text>
          </View>
        </View>

        <View style={[s.card, { padding: 0, overflow: 'hidden' }]}>
          <View style={s.listHeader}>
            <Text style={s.listHeaderTitle}>Line Items</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={`${item.id}-${index}`} style={[s.listItem, index !== invoice.items.length - 1 && s.borderB]}>
              <View style={s.itemRow}>
                <Text style={s.itemName}>{item.name}</Text>
                <Text style={s.itemTotal}>₹{item.lineTotal.toLocaleString('en-IN')}</Text>
              </View>
              <View style={s.itemRow}>
                <Text style={s.itemMeta}>₹{item.price} × {item.quantity} {item.unit}</Text>
                <Text style={s.itemMeta}>GST: {item.gstRate}%</Text>
              </View>
              <View style={s.taxBreakup}>
                <Text style={s.taxLabel}>Taxable: ₹{item.taxableValue.toFixed(2)}</Text>
                {item.cgst > 0 && <Text style={s.taxLabel}>CGST: ₹{item.cgst.toFixed(2)}</Text>}
                {item.sgst > 0 && <Text style={s.taxLabel}>SGST: ₹{item.sgst.toFixed(2)}</Text>}
                {item.igst > 0 && <Text style={s.taxLabel}>IGST: ₹{item.igst.toFixed(2)}</Text>}
              </View>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.summaryTitle}>Tax Summary</Text>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Subtotal (Taxable)</Text><Text style={s.summaryValue}>₹{invoice.totals.taxableAmount.toLocaleString('en-IN')}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>CGST</Text><Text style={s.summaryValue}>₹{invoice.totals.cgstAmount.toFixed(2)}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>SGST</Text><Text style={s.summaryValue}>₹{invoice.totals.sgstAmount.toFixed(2)}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>IGST</Text><Text style={s.summaryValue}>₹{invoice.totals.igstAmount.toFixed(2)}</Text></View>
          <View style={s.grandTotalRow}>
            <Text style={s.grandTotalLabel}>Grand Total</Text>
            <Text style={s.grandTotalValue}>₹{invoice.totals.totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={s.wordsCard}>
          <Text style={s.microLabel}>Amount in Words</Text>
          <Text style={s.wordsText}>{numberToWords(invoice.totals.totalAmount)}</Text>
        </View>

        <View style={s.supplyCard}>
          <Text style={s.microLabel}>Supply Type</Text>
          <Text style={s.supplyText}>{isInterState ? 'Inter-State (IGST)' : isIntraState ? 'Intra-State (CGST + SGST)' : 'N/A'}</Text>
          <Text style={s.supplyMeta}>Seller State: {invoice.seller.gstin?.substring(0, 2) || '—'} | Buyer State: {invoice.buyer.gstin?.substring(0, 2) || '—'}</Text>
        </View>

        {displayStatus !== 'paid' && (
          <TouchableOpacity onPress={handleMarkAsPaid} style={s.markPaidBtn}>
            <Text style={s.markPaidBtnText}>✓ Mark as Paid</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  badgeText: { fontWeight: '600', fontSize: 12 },
  notFoundContainer: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', padding: 16 },
  notFoundTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  notFoundSub: { color: '#6b7280', marginBottom: 16 },
  goBackBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  goBackBtnText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  menuBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  menuBtnText: { color: '#4b5563', fontSize: 24, fontWeight: '700', lineHeight: 28 },
  modalOverlay: { flex: 1 },
  menuCard: { position: 'absolute', top: 56, right: 16, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, minWidth: 160, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
  menuItem: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  menuItemText: { color: '#1f2937', fontWeight: '500', fontSize: 16 },
  scroll: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  microLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  dateValue: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  grandTotalHeader: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', alignItems: 'center' },
  grandTotalHeaderValue: { fontSize: 30, fontWeight: '700', color: '#1d4ed8' },
  partiesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  partyCard: { flex: 1, padding: 16 },
  partyName: { fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  partyGst: { color: '#4b5563', fontSize: 13 },
  listHeader: { padding: 16, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  listHeaderTitle: { fontWeight: '700', color: '#1f2937', fontSize: 16 },
  listItem: { padding: 16 },
  borderB: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { fontWeight: '700', color: '#1f2937', flex: 1 },
  itemTotal: { fontWeight: '700', color: '#1f2937' },
  itemMeta: { color: '#6b7280', fontSize: 13 },
  taxBreakup: { backgroundColor: '#f9fafb', padding: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  taxLabel: { fontSize: 11, color: '#6b7280' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#4b5563' },
  summaryValue: { fontWeight: '600', color: '#1f2937' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  grandTotalLabel: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  grandTotalValue: { fontSize: 20, fontWeight: '700', color: '#1d4ed8' },
  wordsCard: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#dbeafe' },
  wordsText: { color: '#1f2937', fontWeight: '500' },
  supplyCard: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  supplyText: { color: '#1f2937', fontWeight: '500' },
  supplyMeta: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  markPaidBtn: { backgroundColor: '#16a34a', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  markPaidBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
