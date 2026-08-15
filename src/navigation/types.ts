import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type SelectedItem = {
  id: string;
  quantity: number;
};

export type SalesStackParamList = {
  SalesDashboard: undefined;
  CreateInvoice: { selectedItems?: SelectedItem[] };
  ItemSelection: { initialSelectedItems: SelectedItem[] };
  InvoiceView: { invoiceId: string };
};

export type RootTabParamList = {
  Home: undefined;
  SalesStack: NavigatorScreenParams<SalesStackParamList>;
  Estimate: undefined;
  Menu: undefined;
};

// Global type declaration for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}

// Helper types for screens
export type SalesStackScreenProps<T extends keyof SalesStackParamList> = NativeStackScreenProps<
  SalesStackParamList,
  T
>;

export type RootTabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;
