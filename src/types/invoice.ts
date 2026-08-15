export interface PartyDetails {
  name: string;
  address: string;
  gstin?: string;
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
  hsnCode?: string; // Standard for GST invoices
  price: number; // Unit price
  gstRate: number; // e.g., 5, 12, 18, 28
  unit: string; // e.g., 'pcs', 'kg'
  quantity: number;
  discount?: number; // Discount amount
  taxableValue: number; // (price * quantity) - (discount || 0)
  cgst: number;
  sgst: number;
  igst: number;
  lineTotal: number; // taxableValue + all taxes
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // ISO 8601 string, e.g. '2023-10-25'
  dueDate: string; // ISO 8601 string
  seller: PartyDetails;
  buyer: PartyDetails;
  items: InvoiceItem[];
  totals: InvoiceTotals;
}
