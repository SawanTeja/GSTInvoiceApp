import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SalesStackParamList } from './types';

import { SalesDashboardScreen } from '../screens/sales/SalesDashboardScreen';
import { CreateInvoiceScreen } from '../screens/sales/CreateInvoiceScreen';
import { ItemSelectionScreen } from '../screens/sales/ItemSelectionScreen';
import { InvoiceViewScreen } from '../screens/sales/InvoiceViewScreen';

const Stack = createNativeStackNavigator<SalesStackParamList>();

export const SalesStack = () => {
  return (
    <Stack.Navigator initialRouteName="SalesDashboard">
      <Stack.Screen 
        name="SalesDashboard" 
        component={SalesDashboardScreen} 
        options={{ title: 'Sales' }}
      />
      <Stack.Screen 
        name="CreateInvoice" 
        component={CreateInvoiceScreen} 
        options={{ title: 'New Invoice' }}
      />
      <Stack.Screen 
        name="ItemSelection" 
        component={ItemSelectionScreen} 
        options={{ title: 'Select Items' }}
      />
      <Stack.Screen 
        name="InvoiceView" 
        component={InvoiceViewScreen} 
        options={{ title: 'Invoice Details' }}
      />
    </Stack.Navigator>
  );
};
