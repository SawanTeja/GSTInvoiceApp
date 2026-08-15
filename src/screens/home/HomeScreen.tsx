import React, { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { selectInvoices, selectTotalSales, selectInvoiceCount } from '../../store/invoiceSlice';
import { Invoice } from '../../types/invoice';

const screenWidth = Dimensions.get('window').width;

export const HomeScreen = () => {
  const invoices = useSelector(selectInvoices);
  const totalSales = useSelector(selectTotalSales);
  const invoiceCount = useSelector(selectInvoiceCount);

  const { monthlySales, monthlyCount } = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Default zero for all months
    let salesData = months.map(m => ({ label: m, value: 0, frontColor: '#3b82f6' }));
    let countData = months.map(m => ({ label: m, value: 0 }));

    invoices.forEach((inv: Invoice) => {
      const date = new Date(inv.invoiceDate);
      // We'll plot all data for the current year, or fallback safely
      if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
        const mIdx = date.getMonth();
        salesData[mIdx].value += inv.totals.totalAmount;
        countData[mIdx].value += 1;
      }
    });

    // Optional: trim to only show months up to the current month to avoid empty flatlines on the right
    const currentMonth = new Date().getMonth();
    salesData = salesData.slice(0, currentMonth + 1);
    countData = countData.slice(0, currentMonth + 1);

    return { monthlySales: salesData, monthlyCount: countData };
  }, [invoices]);

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 pb-10">
      <View className="mb-6 mt-4">
        <Text className="text-3xl font-bold text-gray-800">Dashboard</Text>
        <Text className="text-gray-500 mt-1">Your business at a glance</Text>
      </View>

      <View className="flex-row justify-between mb-8">
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 mr-2">
          <Text className="text-gray-500 text-sm font-medium mb-1">YTD Sales</Text>
          <Text className="text-2xl font-bold text-blue-600">₹{totalSales.toLocaleString('en-IN')}</Text>
        </View>
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 ml-2">
          <Text className="text-gray-500 text-sm font-medium mb-1">Invoices</Text>
          <Text className="text-2xl font-bold text-gray-800">{invoiceCount}</Text>
        </View>
      </View>

      {invoices.length === 0 ? (
        <View className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 items-center justify-center mt-4">
          <Text className="text-4xl mb-3">📊</Text>
          <Text className="text-gray-500 text-lg font-medium">No sales data yet</Text>
          <Text className="text-gray-400 text-sm mt-1 text-center">Create some invoices to see your monthly charts here.</Text>
        </View>
      ) : (
        <>
          <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 pb-6">
            <Text className="text-lg font-bold text-gray-800 mb-6">Monthly Sales</Text>
            <View className="items-center">
              <BarChart
                data={monthlySales}
                width={screenWidth - 90}
                height={200}
                barWidth={22}
                noOfSections={4}
                barBorderRadius={4}
                frontColor="#3b82f6"
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#e5e7eb"
                yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 11 }}
                isAnimated
              />
            </View>
          </View>

          <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 pb-6">
            <Text className="text-lg font-bold text-gray-800 mb-6">Invoice Count</Text>
            <View className="items-center">
              <LineChart
                data={monthlyCount}
                width={screenWidth - 90}
                height={180}
                color="#8b5cf6"
                thickness={3}
                dataPointsColor="#8b5cf6"
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#e5e7eb"
                yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 11 }}
                isAnimated
                curved
              />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

