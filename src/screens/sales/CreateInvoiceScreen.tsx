import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { SalesStackParamList } from '../../navigation/types';
import { invoiceFormSchema, InvoiceFormValues } from '../../utils/validation';
import { calculateInvoiceTotals, calculateItemTax } from '../../utils/gst';
import { ITEMS } from '../../data/items';
import { addInvoice, updateInvoice, selectInvoices } from '../../store/invoiceSlice';
import { RootState } from '../../store';

type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'CreateInvoice'>;
type CreateInvoiceRouteProp = RouteProp<SalesStackParamList, 'CreateInvoice'>;

const generateId = () => Math.random().toString(36).substring(7);

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDate = (str: string): Date => {
  const parts = str.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date();
};

export const CreateInvoiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateInvoiceRouteProp>();
  const dispatch = useDispatch();

  const isEditMode = !!route.params?.invoiceId;
  const existingInvoice = useSelector((state: RootState) =>
    isEditMode ? state.invoice.invoices.find(inv => inv.id === route.params?.invoiceId) : null
  );
  const allInvoices = useSelector(selectInvoices);

  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const { control, handleSubmit, setValue, setError, formState: { errors }, reset } = useForm<InvoiceFormValues>({
    resolver: yupResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: '',
      invoiceDate: formatDate(new Date()),
      dueDate: formatDate(new Date()),
      seller: { name: '', gstin: '', address: '' },
      buyer: { name: '', gstin: '', address: '' },
      items: [],
    }
  });

  useEffect(() => {
    if (isEditMode && existingInvoice) {
      reset({
        invoiceNumber: existingInvoice.invoiceNumber,
        invoiceDate: existingInvoice.invoiceDate,
        dueDate: existingInvoice.dueDate,
        seller: { name: existingInvoice.seller.name, gstin: existingInvoice.seller.gstin || '', address: existingInvoice.seller.address },
        buyer: { name: existingInvoice.buyer.name, gstin: existingInvoice.buyer.gstin || '', address: existingInvoice.buyer.address },
        items: existingInvoice.items.map(item => ({ id: item.id, quantity: item.quantity })),
      });
    }
  }, [isEditMode, existingInvoice, reset]);

  useEffect(() => {
    if (route.params?.selectedItems) {
      setValue('items', route.params.selectedItems, { shouldValidate: true });
    }
  }, [route.params?.selectedItems, setValue]);

  const items = useWatch({ control, name: 'items' });
  const sellerGST = useWatch({ control, name: 'seller.gstin' });
  const buyerGST = useWatch({ control, name: 'buyer.gstin' });
  const watchedInvoiceDate = useWatch({ control, name: 'invoiceDate' });
  const watchedDueDate = useWatch({ control, name: 'dueDate' });

  const goToAddItems = () => {
    navigation.navigate('ItemSelection', { initialSelectedItems: items || [] });
  };

  const handleQuantityChange = useCallback((itemId: string, delta: number) => {
    const currentItems = items || [];
    const updatedItems = currentItems.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) };
      }
      return item;
    });
    setValue('items', updatedItems, { shouldValidate: true });
  }, [items, setValue]);

  const handleDeleteItem = useCallback((itemId: string) => {
    const currentItems = items || [];
    setValue('items', currentItems.filter(item => item.id !== itemId), { shouldValidate: true });
  }, [items, setValue]);

  const { detailedItems, totals } = useMemo(() => {
    const fullItems = (items || []).map(si => {
      const catalogItem = ITEMS.find(i => i.id === si.id);
      return {
        id: si.id,
        name: catalogItem?.name || 'Unknown',
        price: catalogItem?.price || 0,
        gstRate: catalogItem?.gstRate || 0,
        unit: catalogItem?.unit || 'pcs',
        quantity: si.quantity || 1,
      };
    });
    const calculatedTotals = calculateInvoiceTotals(fullItems, sellerGST, buyerGST);
    return { detailedItems: fullItems, totals: calculatedTotals };
  }, [items, sellerGST, buyerGST]);

  const itemTaxDetails = useMemo(() => {
    return detailedItems.map(item => {
      const tax = calculateItemTax(item, sellerGST, buyerGST);
      return { id: item.id, ...tax };
    });
  }, [detailedItems, sellerGST, buyerGST]);

  const onSubmit = (data: InvoiceFormValues) => {
    const isDuplicate = allInvoices.some(inv =>
      inv.invoiceNumber === data.invoiceNumber && inv.id !== existingInvoice?.id
    );
    if (isDuplicate) {
      setError('invoiceNumber', { type: 'manual', message: 'Invoice number already exists' });
      return;
    }

    const fullInvoiceItems = detailedItems.map(item => {
      const taxDetails = calculateItemTax(item, data.seller.gstin, data.buyer.gstin);
      return { id: item.id, name: item.name, price: item.price, gstRate: item.gstRate, unit: item.unit, quantity: item.quantity, taxableValue: taxDetails.taxableValue, cgst: taxDetails.cgst, sgst: taxDetails.sgst, igst: taxDetails.igst, lineTotal: taxDetails.lineTotal };
    });

    const finalTotals = calculateInvoiceTotals(detailedItems, data.seller.gstin, data.buyer.gstin);

    const invoiceData = {
      id: isEditMode && existingInvoice ? existingInvoice.id : generateId(),
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      seller: { ...data.seller, address: data.seller.address || '' },
      buyer: { ...data.buyer, address: data.buyer.address || '' },
      items: fullInvoiceItems,
      totals: finalTotals,
      status: (isEditMode && existingInvoice ? existingInvoice.status : 'unpaid') as 'unpaid' | 'paid',
    };

    if (isEditMode) { dispatch(updateInvoice(invoiceData)); }
    else { dispatch(addInvoice(invoiceData)); }
    navigation.navigate('SalesDashboard');
  };

  const onInvoiceDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowInvoiceDatePicker(Platform.OS === 'ios');
    if (selectedDate && event.type !== 'dismissed') {
      setValue('invoiceDate', formatDate(selectedDate), { shouldValidate: true });
    }
  };

  const onDueDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDueDatePicker(Platform.OS === 'ios');
    if (selectedDate && event.type !== 'dismissed') {
      setValue('dueDate', formatDate(selectedDate), { shouldValidate: true });
    }
  };

  return (
    <View style={st.container}>
      <ScrollView style={st.scroll} keyboardShouldPersistTaps="handled">
        <Text style={st.pageTitle}>{isEditMode ? 'Edit Invoice' : 'Create Invoice'}</Text>

        {/* INVOICE DETAILS */}
        <View style={st.card}>
          <Text style={st.sectionTitle}>Invoice Details</Text>
          <Text style={st.label}>Invoice Number</Text>
          <Controller control={control} name="invoiceNumber" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={st.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="INV-001" placeholderTextColor="#9ca3af" />
          )} />
          {errors.invoiceNumber && <Text style={st.error}>{errors.invoiceNumber.message}</Text>}

          <Text style={[st.label, { marginTop: 12 }]}>Invoice Date</Text>
          <TouchableOpacity onPress={() => setShowInvoiceDatePicker(true)} style={st.dateBtn}>
            <Text style={st.dateBtnText}>{watchedInvoiceDate || 'Select date'}</Text>
            <Text style={{ color: '#9ca3af' }}>📅</Text>
          </TouchableOpacity>
          {showInvoiceDatePicker && (
            <DateTimePicker value={parseDate(watchedInvoiceDate || formatDate(new Date()))} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onInvoiceDateChange} />
          )}
          {errors.invoiceDate && <Text style={st.error}>{errors.invoiceDate.message}</Text>}

          <Text style={[st.label, { marginTop: 12 }]}>Due Date</Text>
          <TouchableOpacity onPress={() => setShowDueDatePicker(true)} style={st.dateBtn}>
            <Text style={st.dateBtnText}>{watchedDueDate || 'Select date'}</Text>
            <Text style={{ color: '#9ca3af' }}>📅</Text>
          </TouchableOpacity>
          {showDueDatePicker && (
            <DateTimePicker value={parseDate(watchedDueDate || formatDate(new Date()))} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDueDateChange} minimumDate={parseDate(watchedInvoiceDate || formatDate(new Date()))} />
          )}
          {errors.dueDate && <Text style={st.error}>{errors.dueDate.message}</Text>}
        </View>

        {/* SELLER DETAILS */}
        <View style={st.card}>
          <Text style={st.sectionTitle}>Seller Details</Text>
          <Text style={st.label}>Seller GSTIN</Text>
          <Controller control={control} name="seller.gstin" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={st.input} onBlur={onBlur} onChangeText={t => onChange(t.toUpperCase())} value={value} placeholder="27ABCDE1234F1Z5" placeholderTextColor="#9ca3af" autoCapitalize="characters" maxLength={15} />
          )} />
          {errors.seller?.gstin && <Text style={st.error}>{errors.seller.gstin.message}</Text>}

          <Text style={[st.label, { marginTop: 12 }]}>Seller Name</Text>
          <Controller control={control} name="seller.name" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={st.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="My Company Pvt Ltd" placeholderTextColor="#9ca3af" />
          )} />
          {errors.seller?.name && <Text style={st.error}>{errors.seller.name.message}</Text>}
        </View>

        {/* BUYER DETAILS */}
        <View style={st.card}>
          <Text style={st.sectionTitle}>Buyer Details</Text>
          <Text style={st.label}>Buyer GSTIN</Text>
          <Controller control={control} name="buyer.gstin" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={st.input} onBlur={onBlur} onChangeText={t => onChange(t.toUpperCase())} value={value} placeholder="29ABCDE1234F1Z5" placeholderTextColor="#9ca3af" autoCapitalize="characters" maxLength={15} />
          )} />
          {errors.buyer?.gstin && <Text style={st.error}>{errors.buyer.gstin.message}</Text>}

          <Text style={[st.label, { marginTop: 12 }]}>Buyer Name</Text>
          <Controller control={control} name="buyer.name" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={st.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Client Company Pvt Ltd" placeholderTextColor="#9ca3af" />
          )} />
          {errors.buyer?.name && <Text style={st.error}>{errors.buyer.name.message}</Text>}
        </View>

        {/* ITEMS */}
        <View style={st.card}>
          <View style={st.itemsHeader}>
            <Text style={st.sectionTitleNoMargin}>Items</Text>
            <TouchableOpacity onPress={goToAddItems} style={st.addItemBtn}>
              <Text style={st.addItemBtnText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>
          {errors.items && !detailedItems.length && <Text style={st.error}>{typeof errors.items.message === 'string' ? errors.items.message : 'Please add at least one item'}</Text>}

          {detailedItems.length === 0 ? (
            <View style={st.emptyItems}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📦</Text>
              <Text style={{ color: '#6b7280' }}>No items added yet.</Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Tap "+ Add Item" to select products</Text>
            </View>
          ) : (
            detailedItems.map((item, index) => {
              const taxInfo = itemTaxDetails.find(t => t.id === item.id);
              return (
                <View key={item.id} style={[st.itemCard, index !== detailedItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }]}>
                  <View style={st.itemTop}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={st.itemName}>{item.name}</Text>
                      <Text style={st.itemMeta}>₹{item.price} / {item.unit} • GST: {item.gstRate}%</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={st.deleteBtn}>
                      <Text style={st.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={st.itemBottom}>
                    <View style={st.qtyBox}>
                      <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)} style={st.qtyBtn}><Text style={st.qtyBtnText}>−</Text></TouchableOpacity>
                      <Text style={st.qtyValue}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)} style={st.qtyBtn}><Text style={st.qtyBtnText}>+</Text></TouchableOpacity>
                    </View>
                    <Text style={st.lineTotal}>₹{(taxInfo?.lineTotal ?? item.price * item.quantity).toLocaleString('en-IN')}</Text>
                  </View>
                  {taxInfo && (
                    <View style={st.taxBreakup}>
                      <Text style={st.taxText}>Taxable: ₹{taxInfo.taxableValue.toFixed(2)}</Text>
                      {taxInfo.cgst > 0 && <Text style={st.taxText}>CGST: ₹{taxInfo.cgst.toFixed(2)}</Text>}
                      {taxInfo.sgst > 0 && <Text style={st.taxText}>SGST: ₹{taxInfo.sgst.toFixed(2)}</Text>}
                      {taxInfo.igst > 0 && <Text style={st.taxText}>IGST: ₹{taxInfo.igst.toFixed(2)}</Text>}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* TOTALS */}
        <View style={st.totalsCard}>
          <Text style={st.sectionTitle}>Calculation Summary</Text>
          <View style={st.totalRow}><Text style={st.totalLabel}>Subtotal (Taxable)</Text><Text style={st.totalValue}>₹{totals.taxableAmount.toFixed(2)}</Text></View>
          <View style={st.totalRow}><Text style={st.totalLabel}>CGST</Text><Text style={st.totalValue}>₹{totals.cgstAmount.toFixed(2)}</Text></View>
          <View style={st.totalRow}><Text style={st.totalLabel}>SGST</Text><Text style={st.totalValue}>₹{totals.sgstAmount.toFixed(2)}</Text></View>
          <View style={st.totalRow}><Text style={st.totalLabel}>IGST</Text><Text style={st.totalValue}>₹{totals.igstAmount.toFixed(2)}</Text></View>
          <View style={st.grandTotalRow}>
            <Text style={st.grandTotalLabel}>Grand Total</Text>
            <Text style={st.grandTotalValue}>₹{totals.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={st.submitBar}>
        <TouchableOpacity onPress={() => handleSubmit(onSubmit)()} style={st.submitBtn}>
          <Text style={st.submitBtnText}>{isEditMode ? 'Update Invoice' : 'Save Invoice'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1, padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1f2937', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sectionTitleNoMargin: { fontSize: 17, fontWeight: '700', color: '#1f2937' },
  label: { color: '#4b5563', fontWeight: '500', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 4, color: '#1f2937', fontSize: 15 },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 8, marginTop: 2 },
  dateBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBtnText: { color: '#1f2937', fontSize: 15 },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  addItemBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addItemBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  emptyItems: { paddingVertical: 24, alignItems: 'center' },
  itemCard: { paddingVertical: 12 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  itemName: { fontWeight: '700', color: '#1f2937', fontSize: 15 },
  itemMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' },
  qtyBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f3f4f6' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  qtyValue: { paddingHorizontal: 16, fontWeight: '600', minWidth: 40, textAlign: 'center', color: '#1f2937' },
  lineTotal: { fontWeight: '700', color: '#1f2937', fontSize: 15 },
  taxBreakup: { backgroundColor: '#f9fafb', padding: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  taxText: { fontSize: 11, color: '#6b7280' },
  totalsCard: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#dbeafe', marginBottom: 32, elevation: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { color: '#4b5563' },
  totalValue: { fontWeight: '500', color: '#1f2937' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#bfdbfe' },
  grandTotalLabel: { fontSize: 17, fontWeight: '700', color: '#1f2937' },
  grandTotalValue: { fontSize: 17, fontWeight: '700', color: '#1d4ed8' },
  submitBar: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
