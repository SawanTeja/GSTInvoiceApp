import { InvoiceItem, InvoiceTotals } from '../types/invoice';

/**
 * Extracts the 2-digit state code from a GSTIN.
 */
export const getStateCode = (gstin?: string): string => {
  if (!gstin || gstin.length < 2) return '';
  return gstin.substring(0, 2);
};

/**
 * Determines if a transaction is inter-state (between different states).
 * If buyer has no GSTIN, we assume intra-state (same state) for simplicity.
 */
export const isInterState = (sellerGSTIN?: string, buyerGSTIN?: string): boolean => {
  const sellerState = getStateCode(sellerGSTIN);
  const buyerState = getStateCode(buyerGSTIN);
  
  if (!sellerState) return false;
  if (!buyerState) return false; // If buyer has no GSTIN, assume intra-state (B2C local)

  return sellerState !== buyerState;
};

/**
 * Helper to round to 2 decimal places to avoid floating point errors
 */
const round = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Calculates tax details for a single item based on seller and buyer GSTINs.
 */
export const calculateItemTax = (
  item: { price: number; quantity: number; gstRate: number; discount?: number },
  sellerGSTIN?: string,
  buyerGSTIN?: string
): Pick<InvoiceItem, 'taxableValue' | 'cgst' | 'sgst' | 'igst' | 'lineTotal'> => {
  const discountAmount = item.discount || 0;
  const taxableValue = Math.max(0, (item.price * item.quantity) - discountAmount);
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  const isInter = isInterState(sellerGSTIN, buyerGSTIN);

  if (isInter) {
    igst = taxableValue * (item.gstRate / 100);
  } else {
    const halfRate = item.gstRate / 2;
    cgst = taxableValue * (halfRate / 100);
    sgst = taxableValue * (halfRate / 100);
  }

  const roundedTaxable = round(taxableValue);
  const roundedCgst = round(cgst);
  const roundedSgst = round(sgst);
  const roundedIgst = round(igst);
  const lineTotal = round(roundedTaxable + roundedCgst + roundedSgst + roundedIgst);

  return {
    taxableValue: roundedTaxable,
    cgst: roundedCgst,
    sgst: roundedSgst,
    igst: roundedIgst,
    lineTotal,
  };
};

/**
 * Calculates totals for the entire invoice.
 */
export const calculateInvoiceTotals = (
  items: Array<{ price: number; quantity: number; gstRate: number; discount?: number }>,
  sellerGSTIN?: string,
  buyerGSTIN?: string
): InvoiceTotals => {
  let taxableAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalAmount = 0;

  items.forEach((item) => {
    const taxDetails = calculateItemTax(item, sellerGSTIN, buyerGSTIN);
    taxableAmount += taxDetails.taxableValue;
    cgstAmount += taxDetails.cgst;
    sgstAmount += taxDetails.sgst;
    igstAmount += taxDetails.igst;
    totalAmount += taxDetails.lineTotal;
  });

  return {
    taxableAmount: round(taxableAmount),
    cgstAmount: round(cgstAmount),
    sgstAmount: round(sgstAmount),
    igstAmount: round(igstAmount),
    totalAmount: round(totalAmount),
  };
};
