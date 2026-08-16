import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice } from '../types/invoice';
import { RootState } from './index';

interface InvoiceState {
  invoices: Invoice[];
}

const initialState: InvoiceState = {
  invoices: [],
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.push(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex(inv => inv.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter(inv => inv.id !== action.payload);
    },
    markAsPaid: (state, action: PayloadAction<string>) => {
      const invoice = state.invoices.find(inv => inv.id === action.payload);
      if (invoice) {
        invoice.status = 'paid';
      }
    },
  },
});

export const { addInvoice, updateInvoice, deleteInvoice, markAsPaid } = invoiceSlice.actions;

// Selectors
export const selectInvoices = (state: RootState) => state.invoice.invoices;

export const selectInvoiceById = (state: RootState, id: string) => 
  state.invoice.invoices.find(inv => inv.id === id);

export const selectTotalSales = (state: RootState) => 
  state.invoice.invoices.reduce((total, inv) => total + inv.totals.totalAmount, 0);

export const selectTotalTax = (state: RootState) => 
  state.invoice.invoices.reduce((total, inv) => 
    total + inv.totals.cgstAmount + inv.totals.sgstAmount + inv.totals.igstAmount, 0
  );

export const selectInvoiceCount = (state: RootState) => state.invoice.invoices.length;

export default invoiceSlice.reducer;
