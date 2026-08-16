import React, { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { selectInvoices, selectTotalSales, selectInvoiceCount, selectTotalTax } from '../../store/invoiceSlice';
import { Invoice } from '../../types/invoice';

const screenWidth = Dimensions.get('window').width;

export const HomeScreen = () => {
  const invoices = useSelector(selectInvoices);
  const totalSales = useSelector(selectTotalSales);
  const invoiceCount = useSelector(selectInvoiceCount);
  const totalTax = useSelector(selectTotalTax);
  const insets = useSafeAreaInsets();

  const { monthlySales, monthlyCount } = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    let salesData = months.map(m => ({ label: m, value: 0, frontColor: '#3b82f6' }));
    let countData = months.map(m => ({ label: m, value: 0 }));

    invoices.forEach((inv: Invoice) => {
      const date = new Date(inv.invoiceDate);
      if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
        const mIdx = date.getMonth();
        salesData[mIdx] = { ...salesData[mIdx], value: salesData[mIdx].value + inv.totals.totalAmount };
        countData[mIdx] = { ...countData[mIdx], value: countData[mIdx].value + 1 };
      }
    });

    const currentMonth = new Date().getMonth();
    salesData = salesData.slice(0, currentMonth + 1);
    countData = countData.slice(0, currentMonth + 1);

    return { monthlySales: salesData, monthlyCount: countData };
  }, [invoices]);

  const { paidCount, unpaidCount } = useMemo(() => {
    let paid = 0;
    let unpaid = 0;
    invoices.forEach((inv: Invoice) => {
      if (inv.status === 'paid') paid++;
      else unpaid++;
    });
    return { paidCount: paid, unpaidCount: unpaid };
  }, [invoices]);

  return (
    <ScrollView 
      style={s.container} 
      contentContainerStyle={[s.contentContainer, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.headerBlock}>
        <Text style={s.headerTitle}>Dashboard</Text>
        <Text style={s.headerSubtitle}>Your business at a glance</Text>
      </View>

      <View style={s.row}>
        <View style={[s.card, s.flex1, { marginRight: 8 }]}>
          <Text style={s.cardLabel}>YTD Sales</Text>
          <Text style={[s.cardValue, { color: '#2563eb' }]}>₹{totalSales.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[s.card, s.flex1, { marginLeft: 8 }]}>
          <Text style={s.cardLabel}>Invoices</Text>
          <Text style={s.cardValue}>{invoiceCount}</Text>
        </View>
      </View>

      <View style={[s.row, { marginBottom: 20 }]}>
        <View style={[s.card, s.flex1, { marginRight: 8 }]}>
          <Text style={s.cardLabel}>Tax Collected</Text>
          <Text style={[s.cardValue, { fontSize: 20 }]}>₹{totalTax.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[s.flex1, { marginLeft: 8, flexDirection: 'row' }]}>
          <View style={[s.card, s.flex1, { marginRight: 4, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <Text style={{ color: '#15803d', fontSize: 12, fontWeight: '500', marginBottom: 4 }}>Paid</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#15803d' }}>{paidCount}</Text>
          </View>
          <View style={[s.card, s.flex1, { marginLeft: 4, backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
            <Text style={{ color: '#b91c1c', fontSize: 12, fontWeight: '500', marginBottom: 4 }}>Unpaid</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#b91c1c' }}>{unpaidCount}</Text>
          </View>
        </View>
      </View>

      {invoices.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📊</Text>
          <Text style={s.emptyTitle}>No sales data yet</Text>
          <Text style={s.emptySubtitle}>Create some invoices to see your monthly charts here.</Text>
        </View>
      ) : (
        <>
          <View style={[s.card, { marginBottom: 20, paddingBottom: 24 }]}>
            <Text style={s.sectionTitle}>Monthly Sales (₹)</Text>
            <View style={{ alignItems: 'center' }}>
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

          <View style={[s.card, { marginBottom: 20, paddingBottom: 24 }]}>
            <Text style={s.sectionTitle}>Invoice Count (Monthly)</Text>
            <View style={{ alignItems: 'center' }}>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  headerBlock: { marginBottom: 24, marginTop: 16 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1f2937' },
  headerSubtitle: { color: '#6b7280', marginTop: 4 },
  row: { flexDirection: 'row', marginBottom: 12 },
  flex1: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', elevation: 1 },
  cardLabel: { color: '#6b7280', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
  emptyState: { backgroundColor: '#fff', padding: 32, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginTop: 16, elevation: 1 },
  emptyTitle: { color: '#6b7280', fontSize: 18, fontWeight: '500' },
  emptySubtitle: { color: '#9ca3af', fontSize: 14, marginTop: 4, textAlign: 'center' },
});
