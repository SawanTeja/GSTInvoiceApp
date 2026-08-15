import { getStateCode, isInterState, calculateItemTax, calculateInvoiceTotals } from '../gst';

describe('GST Business Logic', () => {
  describe('getStateCode', () => {
    it('should return the first two characters of the GSTIN', () => {
      expect(getStateCode('27ABCDE1234F1Z5')).toBe('27');
      expect(getStateCode('29ABCDE1234F1Z5')).toBe('29');
    });

    it('should return empty string if invalid', () => {
      expect(getStateCode('')).toBe('');
      expect(getStateCode('2')).toBe('');
      expect(getStateCode(undefined)).toBe('');
    });
  });

  describe('isInterState', () => {
    it('should return false for same state (Intra-state)', () => {
      expect(isInterState('27Seller', '27Buyer')).toBe(false);
    });

    it('should return true for different state (Inter-state)', () => {
      expect(isInterState('27Seller', '29Buyer')).toBe(true);
    });

    it('should return false if buyer GSTIN is missing (assumed intra-state)', () => {
      expect(isInterState('27Seller', '')).toBe(false);
      expect(isInterState('27Seller', undefined)).toBe(false);
    });
  });

  describe('calculateItemTax', () => {
    const item18 = { price: 100, quantity: 1, gstRate: 18 };
    const item12 = { price: 200, quantity: 2, gstRate: 12 };
    
    it('should calculate CGST and SGST for same-state', () => {
      const result = calculateItemTax(item18, '27ABC', '27XYZ');
      expect(result.taxableValue).toBe(100);
      expect(result.cgst).toBe(9);
      expect(result.sgst).toBe(9);
      expect(result.igst).toBe(0);
      expect(result.lineTotal).toBe(118);
    });

    it('should calculate IGST for different-state', () => {
      const result = calculateItemTax(item18, '27ABC', '29XYZ');
      expect(result.taxableValue).toBe(100);
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.igst).toBe(18);
      expect(result.lineTotal).toBe(118);
    });

    it('should handle different quantities', () => {
      const result = calculateItemTax(item12, '27ABC', '27XYZ');
      expect(result.taxableValue).toBe(400); // 200 * 2
      expect(result.cgst).toBe(24); // 400 * 6%
      expect(result.sgst).toBe(24);
      expect(result.igst).toBe(0);
      expect(result.lineTotal).toBe(448);
    });

    it('should handle different GST rates (5%, 12%, 18%, 28%)', () => {
      const item5 = { price: 100, quantity: 1, gstRate: 5 };
      expect(calculateItemTax(item5, '27ABC', '27XYZ').cgst).toBe(2.5);
      
      const item12 = { price: 100, quantity: 1, gstRate: 12 };
      expect(calculateItemTax(item12, '27ABC', '27XYZ').cgst).toBe(6);

      const item18 = { price: 100, quantity: 1, gstRate: 18 };
      expect(calculateItemTax(item18, '27ABC', '27XYZ').cgst).toBe(9);

      const item28 = { price: 100, quantity: 1, gstRate: 28 };
      expect(calculateItemTax(item28, '27ABC', '27XYZ').cgst).toBe(14);
    });
    
    it('should return predictable outputs given same inputs (pure function)', () => {
      const res1 = calculateItemTax(item18, '27ABC', '27XYZ');
      const res2 = calculateItemTax(item18, '27ABC', '27XYZ');
      expect(res1).toEqual(res2);
    });
  });

  describe('calculateInvoiceTotals', () => {
    const items = [
      { price: 100, quantity: 1, gstRate: 18 }, // Taxable: 100, Tax: 18
      { price: 200, quantity: 2, gstRate: 12 }, // Taxable: 400, Tax: 48
      { price: 50, quantity: 4, gstRate: 5 }    // Taxable: 200, Tax: 10
    ];

    it('should calculate correct totals for same state (CGST + SGST)', () => {
      const totals = calculateInvoiceTotals(items, '27ABC', '27XYZ');
      // Taxable: 100 + 400 + 200 = 700
      // CGST: 9 + 24 + 5 = 38
      // SGST: 9 + 24 + 5 = 38
      // IGST: 0
      // Total: 700 + 38 + 38 = 776
      expect(totals.taxableAmount).toBe(700);
      expect(totals.cgstAmount).toBe(38);
      expect(totals.sgstAmount).toBe(38);
      expect(totals.igstAmount).toBe(0);
      expect(totals.totalAmount).toBe(776);
    });

    it('should calculate correct totals for different state (IGST)', () => {
      const totals = calculateInvoiceTotals(items, '27ABC', '29XYZ');
      // IGST: 18 + 48 + 10 = 76
      expect(totals.taxableAmount).toBe(700);
      expect(totals.cgstAmount).toBe(0);
      expect(totals.sgstAmount).toBe(0);
      expect(totals.igstAmount).toBe(76);
      expect(totals.totalAmount).toBe(776);
    });

    it('should simulate changing GSTIN after adding items by just re-calling the pure function', () => {
      // Step 1: Initial state, no buyer GSTIN (intra-state assumed)
      const initialTotals = calculateInvoiceTotals(items, '27ABC', '');
      expect(initialTotals.cgstAmount).toBe(38);
      expect(initialTotals.sgstAmount).toBe(38);
      expect(initialTotals.igstAmount).toBe(0);

      // Step 2: User enters buyer GSTIN from different state (inter-state)
      const updatedTotals = calculateInvoiceTotals(items, '27ABC', '29XYZ');
      expect(updatedTotals.cgstAmount).toBe(0);
      expect(updatedTotals.sgstAmount).toBe(0);
      expect(updatedTotals.igstAmount).toBe(76);
    });
  });
});
