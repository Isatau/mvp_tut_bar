// Types for RestoCore MVP 1.1

export type Station = 'BAR' | 'KITCHEN';

export type OrderStatus = 
  | 'draft' 
  | 'pending_send' 
  | 'sent_to_production' 
  | 'pending_payment' 
  | 'paid' 
  | 'print_error';

export type PaymentMethod = 'cash' | 'card' | 'mixed';

export type PrintStatus = 'pending' | 'printing' | 'printed' | 'error';

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  station: Station;
  active: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  station: Station;
  comment?: string;
  sentToProduction: boolean;
  printJobId?: string;
}

export interface Order {
  id: string;
  number: number;
  tableNumber?: number;
  status: OrderStatus;
  items: OrderItem[];
  comment?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  cashAmount?: number;
  cardAmount?: number;
  receivedAmount?: number;
  change?: number;
  createdAt: string;
}

export interface PrintJob {
  id: string;
  orderId: string;
  orderNumber: number;
  station: Station;
  type: 'production' | 'receipt';
  items: OrderItem[];
  status: PrintStatus;
  createdAt: string;
  attempts: number;
  lastError?: string;
  isReprint: boolean;
  tableNumber?: number;
  comment?: string;
}

export interface PrinterSettings {
  barPrinterName: string;
  barPrinterConnection: 'usb';
  kitchenPrinterIp: string;
  kitchenPrinterPort: number;
  kitchenPrinterConnection: 'lan';
  restaurantName: string;
}

export interface AdminUser {
  username: string;
  passwordHash: string;
}

export interface AppState {
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
  printJobs: PrintJob[];
  printerSettings: PrinterSettings;
  nextOrderNumber: number;
  adminAuth: boolean;
}
