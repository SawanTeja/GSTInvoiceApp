import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid'; // we don't have uuid installed, I'll use Math.random() fallback like HomeScreen did

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

// Simple generate ID
const generateId = () => Math.random().toString(36).substring(7);

export const CreateInvoiceScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateInvoiceRouteProp>();
  const dispatch = useDispatch();

  const isEditMode = !!route.params?.invoiceId;
  const existingInvoice = useSelector((state: RootState) => 
    isEditMode ? state.invoice.invoices.find(inv => inv.id === route.params?.invoiceId) : null
  );
  const allInvoices = useSelector(selectInvoices);

  // Set up React Hook Form
  const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm<InvoiceFormValues>({
    resolver: yupResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      seller: { name: '', gstin: '', address: '' },
      buyer: { name: '', gstin: '', address: '' },
      items: [],
    }
  });

  // Pre-fill if Edit Mode
  useEffect(() => {
    if (isEditMode && existingInvoice) {
      reset({
        invoiceNumber: existingInvoice.invoiceNumber,
        invoiceDate: existingInvoice.invoiceDate,
        dueDate: existingInvoice.dueDate,
        seller: {
          name: existingInvoice.seller.name,
          gstin: existingInvoice.seller.gstin || '',
          address: existingInvoice.seller.address,
        },
        buyer: {
          name: existingInvoice.buyer.name,
          gstin: existingInvoice.buyer.gstin || '',
          address: existingInvoice.buyer.address,
        },
        items: existingInvoice.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
        })),
      });
    }
  }, [isEditMode, existingInvoice, reset]);

  // Handle selected items returned from ItemSelectionScreen
  useEffect(() => {
    if (route.params?.selectedItems) {
      setValue('items', route.params.selectedItems, { shouldValidate: true });
    }
  }, [route.params?.selectedItems, setValue]);

  // Reactive Data Watching
  const items = useWatch({ control, name: 'items' });
  const sellerGST = useWatch({ control, name: 'seller.gstin' });
  const buyerGST = useWatch({ control, name: 'buyer.gstin' });

  const goToAddItems = () => {
    navigation.navigate('ItemSelection', { initialSelectedItems: items || [] });
  };

  // Derive full item details and totals
  const { detailedItems, totals } = useMemo(() => {
    const fullItems = (items || []).map(si => {
      const catalogItem = ITEMS.find(i => i.id === si.id);
      return {
        ...catalogItem,
        id: si.id,
        name: catalogItem?.name || 'Unknown',
        price: catalogItem?.price || 0,
        gstRate: catalogItem?.gstRate || 0,
        unit: catalogItem?.unit || 'pcs',
        quantity: si.quantity,
      };
    });

    const calculatedTotals = calculateInvoiceTotals(fullItems, sellerGST, buyerGST);

    return { detailedItems: fullItems, totals: calculatedTotals };
  }, [items, sellerGST, buyerGST]);

  const onSubmit = (data: InvoiceFormValues) => {
    // Check for duplicate invoice number
    const isDuplicate = allInvoices.some(inv => 
      inv.invoiceNumber === data.invoiceNumber && inv.id !== existingInvoice?.id
    );

    if (isDuplicate) {
      Alert.alert('Duplicate Invoice Number', 'An invoice with this number already exists. Please choose a different number.');
      return;
    }

    // Map detailed items to match InvoiceItem type
    const fullInvoiceItems = detailedItems.map(item => {
      const taxDetails = calculateItemTax(item, data.seller.gstin, data.buyer.gstin);
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        gstRate: item.gstRate,
        unit: item.unit,
        quantity: item.quantity,
        taxableValue: taxDetails.taxableValue,
        cgst: taxDetails.cgst,
        sgst: taxDetails.sgst,
        igst: taxDetails.igst,
        lineTotal: taxDetails.lineTotal,
      };
    });

    const invoiceData = {
      id: isEditMode && existingInvoice ? existingInvoice.id : generateId(),
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      seller: { ...data.seller },
      buyer: { ...data.buyer },
      items: fullInvoiceItems,
      totals: totals,
    };

    if (isEditMode) {
      dispatch(updateInvoice(invoiceData));
    } else {
      dispatch(addInvoice(invoiceData));
    }

    navigation.navigate('SalesDashboard');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
        </Text>

        {/* INVOICE DETAILS */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Invoice Details</Text>
          
          <Text className="text-gray-600 font-medium mb-1">Invoice Number</Text>
          <Controller
            control={control}
            name="invoiceNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 text-black"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="INV-001"
              />
            )}
          />
          {errors.invoiceNumber && <Text className="text-red-500 text-sm mb-3">{errors.invoiceNumber.message}</Text>}

          <Text className="text-gray-600 font-medium mb-1 mt-3">Invoice Date (YYYY-MM-DD)</Text>
          <Controller
            control={control}
            name="invoiceDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 text-black"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.invoiceDate && <Text className="text-red-500 text-sm mb-3">{errors.invoiceDate.message}</Text>}

          <Text className="text-gray-600 font-medium mb-1 mt-3">Due Date (YYYY-MM-DD)</Text>
          <Controller
            control={control}
            name="dueDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 text-black"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.dueDate && <Text className="text-red-500 text-sm mb-3">{errors.dueDate.message}</Text>}
        </View>

        {/* SELLER DETAILS */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Seller Details</Text>
          
          <Text className="text-gray-600 font-medium mb-1">Seller Name</Text>
          <Controller
            control={control}
            name="seller.name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 text-black"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="My Company"
              />
            )}
          />
          {errors.seller?.name && <Text className="text-red-500 text-sm mb-3">{errors.seller.name.message}</Text>}

          <Text className="text-gray-600 font-medium mb-1 mt-3">Seller GSTIN</Text>
          <Controller
            control={control}
            name="seller.gstin"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 text-black uppercase"
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.toUpperCase())}
                value={value}
                placeholder="27ABCDE1234F1Z5"
                autoCapitalize="characters"
              />
            )}
          />
          {errors.seller?.gstin && <Text className="text-red-500 text-sm mb-3">{errors.seller.gstin.message}</Text>}
        </View>

        {/* BUYER DETAILS */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Buyer Details</Text>
          
          <Text className="text-gray-600 font-medium mb-1">Buyer Name</Text>
          <Controller
            control={control}
            name="buyer.name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 text-black"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Client Company"
              />
            )}
          />
          {errors.buyer?.name && <Text className="text-red-500 text-sm mb-3">{errors.buyer.name.message}</Text>}

          <Text className="text-gray-600 font-medium mb-1 mt-3">Buyer GSTIN</Text>
          <Controller
            control={control}
            name="buyer.gstin"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-1 text-black uppercase"
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.toUpperCase())}
                value={value}
                placeholder="29ABCDE1234F1Z5"
                autoCapitalize="characters"
              />
            )}
          />
          {errors.buyer?.gstin && <Text className="text-red-500 text-sm mb-3">{errors.buyer.gstin.message}</Text>}
        </View>

        {/* ITEMS SECTION */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
          <View className="flex-row justify-between items-center mb-3 border-b border-gray-100 pb-2">
            <Text className="text-lg font-bold text-gray-800">Items</Text>
            <TouchableOpacity onPress={goToAddItems}>
              <Text className="text-blue-600 font-semibold">+ Add/Edit</Text>
            </TouchableOpacity>
          </View>
          
          {errors.items && !detailedItems.length && (
            <Text className="text-red-500 text-sm mb-3">{errors.items.message}</Text>
          )}

          {detailedItems.length === 0 ? (
            <Text className="text-gray-500 italic mb-2">No items added yet.</Text>
          ) : (
            <View className="mb-2">
              {detailedItems.map((item) => (
                <View key={item.id} className="flex-row justify-between py-2 border-b border-gray-100">
                  <View>
                    <Text className="font-medium text-gray-800">{item.name}</Text>
                    <Text className="text-sm text-gray-500">₹{item.price} x {item.quantity} (GST: {item.gstRate}%)</Text>
                  </View>
                  <Text className="font-semibold text-gray-800">
                    ₹{item.price * item.quantity}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* TOTALS SUMMARY */}
        <View className="bg-blue-50 p-4 rounded-xl shadow-sm mb-8 border border-blue-100">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-blue-200 pb-2">Calculation Summary</Text>
          
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Subtotal (Taxable)</Text>
            <Text className="font-medium text-gray-800">₹{totals.taxableAmount.toFixed(2)}</Text>
          </View>
          
          {totals.cgstAmount > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">CGST</Text>
              <Text className="font-medium text-gray-800">₹{totals.cgstAmount.toFixed(2)}</Text>
            </View>
          )}
          
          {totals.sgstAmount > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">SGST</Text>
              <Text className="font-medium text-gray-800">₹{totals.sgstAmount.toFixed(2)}</Text>
            </View>
          )}
          
          {totals.igstAmount > 0 && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">IGST</Text>
              <Text className="font-medium text-gray-800">₹{totals.igstAmount.toFixed(2)}</Text>
            </View>
          )}

          <View className="flex-row justify-between mt-2 pt-2 border-t border-blue-200">
            <Text className="text-lg font-bold text-gray-800">Grand Total</Text>
            <Text className="text-lg font-bold text-blue-700">₹{totals.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* FLOATING SUBMIT BUTTON */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)}
          className="bg-blue-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            {isEditMode ? 'Update Invoice' : 'Save Invoice'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
