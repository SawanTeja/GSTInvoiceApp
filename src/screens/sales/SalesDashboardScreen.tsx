import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SalesStackParamList } from '../../navigation/types';
import { selectInvoices, selectTotalSales, selectTotalTax, selectInvoiceCount } from '../../store/invoiceSlice';
import { Invoice } from '../../types/invoice';

type NavigationProp = NativeStackNavigationProp<SalesStackParamList, 'SalesDashboard'>;

export const SalesDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const invoices = useSelector(selectInvoices);
  const totalSales = useSelector(selectTotalSales);
  const totalTax = useSelector(selectTotalTax);
  const invoiceCount = useSelector(selectInvoiceCount);

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('InvoiceView', { invoiceId: item.id })}
      className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100 flex-row justify-between items-center"
    >
      <View>
        <Text className="font-bold text-gray-800 text-base mb-1">{item.invoiceNumber}</Text>
        <Text className="text-gray-500">{item.buyer.name}</Text>
        <Text className="text-gray-400 text-sm mt-1">{item.invoiceDate}</Text>
      </View>
      <View className="items-end">
        <Text className="font-bold text-blue-700 text-lg">₹{item.totals.totalAmount.toLocaleString('en-IN')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      
      {/* Stats Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 mr-2">
          <Text className="text-gray-500 text-sm font-medium mb-1">Total Invoices</Text>
          <Text className="text-2xl font-bold text-gray-800">{invoiceCount}</Text>
        </View>
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 ml-2">
          <Text className="text-gray-500 text-sm font-medium mb-1">Total Value</Text>
          <Text className="text-2xl font-bold text-blue-600">₹{totalSales.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <Text className="text-gray-500 text-sm font-medium mb-1">Total Tax Generated</Text>
        <Text className="text-xl font-bold text-gray-800">₹{totalTax.toLocaleString('en-IN')}</Text>
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Recent Invoices</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateInvoice', {})}>
          <Text className="text-blue-600 font-semibold">+ New Invoice</Text>
        </TouchableOpacity>
      </View>

      {invoices.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-10">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-blue-500 text-2xl">📄</Text>
          </View>
          <Text className="text-gray-500 text-lg mb-2">No invoices yet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateInvoice', {})}>
            <Text className="text-blue-600 font-medium">Create your first invoice</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};
