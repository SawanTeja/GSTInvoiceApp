export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  gstRate: number; // 5, 12, 18, 28
  unit: string;
}

export const ITEMS: CatalogItem[] = [
  { id: 'item-001', name: 'Laptop Stand', price: 1500, gstRate: 18, unit: 'pcs' },
  { id: 'item-002', name: 'Mechanical Keyboard', price: 4500, gstRate: 18, unit: 'pcs' },
  { id: 'item-003', name: 'Wireless Mouse', price: 1200, gstRate: 18, unit: 'pcs' },
  { id: 'item-004', name: '27-inch Monitor', price: 15000, gstRate: 28, unit: 'pcs' },
  { id: 'item-005', name: 'USB-C Cable (2m)', price: 300, gstRate: 12, unit: 'pcs' },
  { id: 'item-006', name: 'HD Webcam', price: 2500, gstRate: 18, unit: 'pcs' },
  { id: 'item-007', name: 'Noise Cancelling Headphones', price: 8000, gstRate: 18, unit: 'pcs' },
  { id: 'item-008', name: 'LED Desk Lamp', price: 850, gstRate: 12, unit: 'pcs' },
  { id: 'item-009', name: 'Extended Mouse Pad', price: 400, gstRate: 5, unit: 'pcs' },
  { id: 'item-010', name: '65W Power Adapter', price: 1800, gstRate: 18, unit: 'pcs' },
];
