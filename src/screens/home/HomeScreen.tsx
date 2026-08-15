import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addInvoice, updateInvoice, deleteInvoice, selectInvoices, selectInvoiceCount, selectTotalSales } from '../../store/invoiceSlice';

export const HomeScreen = () => {
  const dispatch = useDispatch();
  const invoices = useSelector(selectInvoices);
  const invoiceCount = useSelector(selectInvoiceCount);
  const totalSales = useSelector(selectTotalSales);

  const handleAddTestInvoice = () => {
    const newInvoice = {
      id: Math.random().toString(36).substring(7),
      invoiceNumber: `INV-${Math.floor(Math.random() * 1000)}`,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      seller: { name: 'My Company', address: '123 Main St' },
      buyer: { name: 'Customer Inc', address: '456 Market St' },
      items: [
        {
          id: 'item1',
          name: 'Consulting Services',
          price: 1000,
          quantity: 2,
          gstRate: 18,
          unit: 'hrs',
          taxableValue: 2000,
          cgst: 180,
          sgst: 180,
          igst: 0,
          lineTotal: 2360,
        }
      ],
      totals: {
        taxableAmount: 2000,
        cgstAmount: 180,
        sgstAmount: 180,
        igstAmount: 0,
        totalAmount: 2360,
      }
    };
    dispatch(addInvoice(newInvoice));
  };

  const handleUpdateLastInvoice = () => {
    if (invoices.length > 0) {
      const lastInvoice = invoices[invoices.length - 1];
      const updatedInvoice = {
        ...lastInvoice,
        buyer: { ...lastInvoice.buyer, name: 'Updated Customer' }
      };
      dispatch(updateInvoice(updatedInvoice));
    }
  };

  const handleDeleteLastInvoice = () => {
    if (invoices.length > 0) {
      const lastInvoice = invoices[invoices.length - 1];
      dispatch(deleteInvoice(lastInvoice.id));
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="items-center justify-center py-6">
        <Text className="text-2xl font-bold text-blue-600 mb-2">GST Invoice App</Text>
        <Text className="text-gray-500 mb-6">Setup Successful! Phase 2: Redux Data Models.</Text>
      </View>

      <View className="bg-gray-100 p-4 rounded-xl mb-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-2">Redux State Stats</Text>
        <Text className="text-gray-700">Total Invoices: <Text className="font-bold">{invoiceCount}</Text></Text>
        <Text className="text-gray-700">Total Sales: <Text className="font-bold">₹{totalSales}</Text></Text>
      </View>

      <View className="flex-row flex-wrap justify-between mb-6">
        <TouchableOpacity 
          onPress={handleAddTestInvoice}
          className="bg-blue-500 py-3 px-4 rounded-lg w-[48%] mb-4 items-center shadow"
        >
          <Text className="text-white font-semibold">Add Invoice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleUpdateLastInvoice}
          className="bg-yellow-500 py-3 px-4 rounded-lg w-[48%] mb-4 items-center shadow"
        >
          <Text className="text-white font-semibold">Update Last</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleDeleteLastInvoice}
          className="bg-red-500 py-3 px-4 rounded-lg w-full items-center shadow"
        >
          <Text className="text-white font-semibold">Delete Last Invoice</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-10">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Invoices in State:</Text>
        {invoices.map((inv) => (
          <View key={inv.id} className="bg-white border border-gray-200 p-3 rounded-lg mb-2 shadow-sm">
            <Text className="font-bold text-gray-800">{inv.invoiceNumber}</Text>
            <Text className="text-sm text-gray-600">Buyer: {inv.buyer.name}</Text>
            <Text className="text-sm text-gray-600">Total: ₹{inv.totals.totalAmount}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
