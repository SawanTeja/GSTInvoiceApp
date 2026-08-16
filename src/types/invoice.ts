export interface PartyDetails {
  name: string;
  address: string;
  gstin: string;
}

export interface InvoiceTotals {
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface InvoiceItem {
  id: string;
  name: string;
  hsnCode?: string;
  price: number;
  gstRate: number;
  unit: string;
  quantity: number;
  discount?: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  seller: PartyDetails;
  buyer: PartyDetails;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  status: 'unpaid' | 'paid';
}
