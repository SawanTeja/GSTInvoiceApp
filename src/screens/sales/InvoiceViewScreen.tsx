import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SalesStackParamList } from '../../navigation/types';
import { RootState } from '../../store';
import { deleteInvoice, selectInvoiceById } from '../../store/invoiceSlice';

type InvoiceViewRouteProp = RouteProp<SalesStackParamList, 'InvoiceView'>;
type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'InvoiceView'>;

export const InvoiceViewScreen = () => {
  const route = useRoute<InvoiceViewRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { invoiceId } = route.params;

  const invoice = useSelector((state: RootState) => selectInvoiceById(state, invoiceId));

  if (!invoice) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-4">
        <Text className="text-xl font-bold text-gray-800">Invoice Not Found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-blue-600 px-6 py-2 rounded-lg">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEdit = () => {
    navigation.navigate('CreateInvoice', { invoiceId: invoice.id });
  };

  const handleDelete = () => {
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Top Navigation Bar with Actions */}
      <View className="flex-row justify-between items-center bg-white p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-blue-600 font-bold text-lg">← Back</Text>
        </TouchableOpacity>
        <View className="flex-row space-x-4 gap-4">
          <TouchableOpacity onPress={handleEdit}>
            <Text className="text-blue-600 font-semibold text-lg">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="text-red-500 font-semibold text-lg">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        {/* Header block */}
        <View className="bg-white p-5 rounded-xl shadow-sm mb-4 border border-gray-100 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">{invoice.invoiceNumber}</Text>
            <Text className="text-gray-500 mt-1">Date: {invoice.invoiceDate}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-blue-700">₹{invoice.totals.totalAmount.toLocaleString('en-IN')}</Text>
            <Text className="text-gray-500 mt-1">Due: {invoice.dueDate}</Text>
          </View>
        </View>

        {/* Parties */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 mr-2">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed By (Seller)</Text>
            <Text className="font-bold text-gray-800 mb-1">{invoice.seller.name}</Text>
            <Text className="text-gray-600 text-sm">GST: {invoice.seller.gstin}</Text>
          </View>
          
          <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 ml-2">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To (Buyer)</Text>
            <Text className="font-bold text-gray-800 mb-1">{invoice.buyer.name}</Text>
            <Text className="text-gray-600 text-sm">GST: {invoice.buyer.gstin}</Text>
          </View>
        </View>

        {/* Items List */}
        <View className="bg-white rounded-xl shadow-sm mb-4 border border-gray-100 overflow-hidden">
          <View className="p-4 bg-gray-50 border-b border-gray-200">
            <Text className="font-bold text-gray-800 text-lg">Items</Text>
          </View>
          
          {invoice.items.map((item, index) => (
            <View key={item.id} className={`p-4 ${index !== invoice.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <View className="flex-row justify-between mb-1">
                <Text className="font-bold text-gray-800">{item.name}</Text>
                <Text className="font-bold text-gray-800">₹{item.taxableValue.toLocaleString('en-IN')}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">₹{item.price} x {item.quantity} {item.unit}</Text>
                <Text className="text-gray-500 text-sm">GST: {item.gstRate}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary Totals */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-8 border border-gray-100">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal (Taxable)</Text>
            <Text className="font-semibold text-gray-800">₹{invoice.totals.taxableAmount.toLocaleString('en-IN')}</Text>
          </View>
          
          {invoice.totals.cgstAmount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">CGST</Text>
              <Text className="font-semibold text-gray-800">₹{invoice.totals.cgstAmount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          
          {invoice.totals.sgstAmount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">SGST</Text>
              <Text className="font-semibold text-gray-800">₹{invoice.totals.sgstAmount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          
          {invoice.totals.igstAmount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">IGST</Text>
              <Text className="font-semibold text-gray-800">₹{invoice.totals.igstAmount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          
          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Grand Total</Text>
            <Text className="text-xl font-bold text-blue-700">₹{invoice.totals.totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

