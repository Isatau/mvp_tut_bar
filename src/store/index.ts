import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, MenuItem, Order, OrderItem, Payment, PrintJob, PrinterSettings, Station } from '../types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface StoreState {
  // Data
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
  printJobs: PrintJob[];
  printerSettings: PrinterSettings;
  nextOrderNumber: number;
  adminAuth: boolean;
  
  // Current order state
  currentOrderId: string | null;
  
  // Actions - Categories
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  
  // Actions - Menu Items
  addMenuItem: (name: string, categoryId: string, price: number, station: Station) => void;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // Actions - Orders
  createOrder: (tableNumber?: number) => string;
  addOrderItem: (orderId: string, menuItem: MenuItem, quantity?: number) => void;
  updateOrderItemQuantity: (orderId: string, itemId: string, quantity: number) => void;
  removeOrderItem: (orderId: string, itemId: string) => void;
  updateOrderComment: (orderId: string, comment: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  sendOrderToProduction: (orderId: string) => void;
  
  // Actions - Payments
  processPayment: (orderId: string, method: 'cash' | 'card' | 'mixed', cashAmount?: number, cardAmount?: number, receivedAmount?: number) => boolean;
  
  // Actions - Print Jobs
  addPrintJob: (job: Omit<PrintJob, 'id' | 'createdAt' | 'attempts'>) => void;
  updatePrintJobStatus: (jobId: string, status: PrintJob['status'], error?: string) => void;
  retryPrintJob: (jobId: string) => void;
  
  // Actions - Settings
  updatePrinterSettings: (settings: Partial<PrinterSettings>) => void;
  
  // Actions - Admin
  login: (password: string) => boolean;
  logout: () => void;
  
  // Actions - UI
  setCurrentOrder: (orderId: string | null) => void;
  
  // Actions - Backup
  exportData: () => string;
  importData: (json: string) => boolean;
}

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Напитки', sortOrder: 1 },
  { id: 'cat-2', name: 'Коктейли', sortOrder: 2 },
  { id: 'cat-3', name: 'Закуски', sortOrder: 3 },
  { id: 'cat-4', name: 'Основные блюда', sortOrder: 4 },
  { id: 'cat-5', name: 'Десерты', sortOrder: 5 },
];

const defaultMenuItems: MenuItem[] = [
  { id: 'item-1', name: 'Кофе Американо', categoryId: 'cat-1', price: 250, station: 'BAR', active: true },
  { id: 'item-2', name: 'Кофе Латте', categoryId: 'cat-1', price: 320, station: 'BAR', active: true },
  { id: 'item-3', name: 'Чай зелёный', categoryId: 'cat-1', price: 200, station: 'BAR', active: true },
  { id: 'item-4', name: 'Сок апельсиновый', categoryId: 'cat-1', price: 280, station: 'BAR', active: true },
  { id: 'item-5', name: 'Мохито', categoryId: 'cat-2', price: 450, station: 'BAR', active: true },
  { id: 'item-6', name: 'Маргарита', categoryId: 'cat-2', price: 500, station: 'BAR', active: true },
  { id: 'item-7', name: 'Брускетта', categoryId: 'cat-3', price: 380, station: 'KITCHEN', active: true },
  { id: 'item-8', name: 'Салат Цезарь', categoryId: 'cat-3', price: 450, station: 'KITCHEN', active: true },
  { id: 'item-9', name: 'Стейк Рибай', categoryId: 'cat-4', price: 1800, station: 'KITCHEN', active: true },
  { id: 'item-10', name: 'Паста Карбонара', categoryId: 'cat-4', price: 650, station: 'KITCHEN', active: true },
  { id: 'item-11', name: 'Тирамису', categoryId: 'cat-5', price: 400, station: 'KITCHEN', active: true },
  { id: 'item-12', name: 'Чизкейк', categoryId: 'cat-5', price: 380, station: 'KITCHEN', active: true },
];

const defaultPrinterSettings: PrinterSettings = {
  barPrinterName: 'RONGTA RP80-USB',
  barPrinterConnection: 'usb',
  kitchenPrinterIp: '192.168.1.100',
  kitchenPrinterPort: 9100,
  kitchenPrinterConnection: 'lan',
  restaurantName: 'RestoCore Demo',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,
      menuItems: defaultMenuItems,
      orders: [],
      printJobs: [],
      printerSettings: defaultPrinterSettings,
      nextOrderNumber: 1,
      adminAuth: false,
      currentOrderId: null,

      // Categories
      addCategory: (name) => {
        const newCat: Category = {
          id: generateId(),
          name,
          sortOrder: get().categories.length + 1,
        };
        set({ categories: [...get().categories, newCat] });
      },

      updateCategory: (id, name) => {
        set({
          categories: get().categories.map(c => c.id === id ? { ...c, name } : c),
        });
      },

      deleteCategory: (id) => {
        set({
          categories: get().categories.filter(c => c.id !== id),
          menuItems: get().menuItems.filter(m => m.categoryId !== id),
        });
      },

      // Menu Items
      addMenuItem: (name, categoryId, price, station) => {
        const newItem: MenuItem = {
          id: generateId(),
          name,
          categoryId,
          price,
          station,
          active: true,
        };
        set({ menuItems: [...get().menuItems, newItem] });
      },

      updateMenuItem: (id, data) => {
        set({
          menuItems: get().menuItems.map(m => m.id === id ? { ...m, ...data } : m),
        });
      },

      deleteMenuItem: (id) => {
        set({ menuItems: get().menuItems.filter(m => m.id !== id) });
      },

      // Orders
      createOrder: (tableNumber) => {
        const id = generateId();
        const number = get().nextOrderNumber;
        const now = new Date().toISOString();
        const newOrder: Order = {
          id,
          number,
          tableNumber,
          status: 'draft',
          items: [],
          createdAt: now,
          updatedAt: now,
        };
        set({
          orders: [...get().orders, newOrder],
          nextOrderNumber: number + 1,
          currentOrderId: id,
        });
        return id;
      },

      addOrderItem: (orderId, menuItem, quantity = 1) => {
        const orders = get().orders.map(o => {
          if (o.id !== orderId) return o;
          const existingItem = o.items.find(i => i.menuItemId === menuItem.id && !i.sentToProduction);
          if (existingItem) {
            return {
              ...o,
              updatedAt: new Date().toISOString(),
              items: o.items.map(i => 
                i.id === existingItem.id 
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          const newItem: OrderItem = {
            id: generateId(),
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity,
            station: menuItem.station,
            sentToProduction: false,
          };
          return {
            ...o,
            updatedAt: new Date().toISOString(),
            items: [...o.items, newItem],
          };
        });
        set({ orders });
      },

      updateOrderItemQuantity: (orderId, itemId, quantity) => {
        const orders = get().orders.map(o => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            updatedAt: new Date().toISOString(),
            items: quantity <= 0
              ? o.items.filter(i => i.id !== itemId)
              : o.items.map(i => i.id === itemId ? { ...i, quantity } : i),
          };
        });
        set({ orders });
      },

      removeOrderItem: (orderId, itemId) => {
        const orders = get().orders.map(o => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            updatedAt: new Date().toISOString(),
            items: o.items.filter(i => i.id !== itemId),
          };
        });
        set({ orders });
      },

      updateOrderComment: (orderId, comment) => {
        const orders = get().orders.map(o => {
          if (o.id !== orderId) return o;
          return { ...o, comment, updatedAt: new Date().toISOString() };
        });
        set({ orders });
      },

      updateOrderStatus: (orderId, status) => {
        const orders = get().orders.map(o => {
          if (o.id !== orderId) return o;
          return { ...o, status, updatedAt: new Date().toISOString() };
        });
        set({ orders });
      },

      sendOrderToProduction: (orderId) => {
        const order = get().orders.find(o => o.id === orderId);
        if (!order) return;

        const unsentItems = order.items.filter(i => !i.sentToProduction);
        if (unsentItems.length === 0) return;

        // Group by station
        const barItems = unsentItems.filter(i => i.station === 'BAR');
        const kitchenItems = unsentItems.filter(i => i.station === 'KITCHEN');

        const newPrintJobs: PrintJob[] = [];
        const now = new Date().toISOString();

        if (barItems.length > 0) {
          newPrintJobs.push({
            id: generateId(),
            orderId: order.id,
            orderNumber: order.number,
            station: 'BAR',
            type: 'production',
            items: barItems,
            status: 'printed', // Simulated success
            createdAt: now,
            attempts: 1,
            isReprint: false,
            tableNumber: order.tableNumber,
            comment: order.comment,
          });
        }

        if (kitchenItems.length > 0) {
          newPrintJobs.push({
            id: generateId(),
            orderId: order.id,
            orderNumber: order.number,
            station: 'KITCHEN',
            type: 'production',
            items: kitchenItems,
            status: 'printed', // Simulated success
            createdAt: now,
            attempts: 1,
            isReprint: false,
            tableNumber: order.tableNumber,
            comment: order.comment,
          });
        }

        // Mark items as sent
        const sentItemIds = unsentItems.map(i => i.id);
        const orders = get().orders.map(o => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            status: 'sent_to_production' as const,
            updatedAt: now,
            items: o.items.map(i => 
              sentItemIds.includes(i.id) 
                ? { ...i, sentToProduction: true }
                : i
            ),
          };
        });

        set({
          orders,
          printJobs: [...get().printJobs, ...newPrintJobs],
        });
      },

      // Payments
      processPayment: (orderId, method, cashAmount, cardAmount, receivedAmount) => {
        const order = get().orders.find(o => o.id === orderId);
        if (!order) return false;
        if (order.payments && order.payments.length > 0) return false; // Already paid

        const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        
        let payment: Payment;
        const now = new Date().toISOString();

        switch (method) {
          case 'cash':
            if ((receivedAmount || 0) < total) return false;
            payment = {
              id: generateId(),
              orderId,
              method: 'cash',
              amount: total,
              receivedAmount: receivedAmount,
              change: (receivedAmount || 0) - total,
              createdAt: now,
            };
            break;
          case 'card':
            payment = {
              id: generateId(),
              orderId,
              method: 'card',
              amount: total,
              createdAt: now,
            };
            break;
          case 'mixed':
            if ((cashAmount || 0) + (cardAmount || 0) !== total) return false;
            payment = {
              id: generateId(),
              orderId,
              method: 'mixed',
              amount: total,
              cashAmount,
              cardAmount,
              createdAt: now,
            };
            break;
          default:
            return false;
        }

        // Create receipt print job
        const receiptJob: PrintJob = {
          id: generateId(),
          orderId: order.id,
          orderNumber: order.number,
          station: 'BAR',
          type: 'receipt',
          items: order.items,
          status: 'printed',
          createdAt: now,
          attempts: 1,
          isReprint: false,
          tableNumber: order.tableNumber,
        };

        const orders = get().orders.map(o => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            status: 'paid' as const,
            paidAt: now,
            updatedAt: now,
            payments: [payment],
          };
        });

        set({
          orders,
          printJobs: [...get().printJobs, receiptJob],
        });

        return true;
      },

      // Print Jobs
      addPrintJob: (job) => {
        const newJob: PrintJob = {
          ...job,
          id: generateId(),
          createdAt: new Date().toISOString(),
          attempts: 0,
        };
        set({ printJobs: [...get().printJobs, newJob] });
      },

      updatePrintJobStatus: (jobId, status, error) => {
        set({
          printJobs: get().printJobs.map(j => 
            j.id === jobId 
              ? { ...j, status, lastError: error, attempts: j.attempts + 1 }
              : j
          ),
        });
      },

      retryPrintJob: (jobId) => {
        set({
          printJobs: get().printJobs.map(j => 
            j.id === jobId 
              ? { ...j, status: 'printed', attempts: j.attempts + 1, lastError: undefined, isReprint: true }
              : j
          ),
        });
      },

      // Settings
      updatePrinterSettings: (settings) => {
        set({ printerSettings: { ...get().printerSettings, ...settings } });
      },

      // Admin
      login: (password) => {
        // Simple password check for MVP (in real app would use bcrypt)
        if (password === 'admin123') {
          set({ adminAuth: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ adminAuth: false });
      },

      // UI
      setCurrentOrder: (orderId) => {
        set({ currentOrderId: orderId });
      },

      // Backup
      exportData: () => {
        const { categories, menuItems, orders, printJobs, printerSettings, nextOrderNumber } = get();
        return JSON.stringify({ categories, menuItems, orders, printJobs, printerSettings, nextOrderNumber }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.categories && data.menuItems) {
            set({
              categories: data.categories,
              menuItems: data.menuItems,
              orders: data.orders || [],
              printJobs: data.printJobs || [],
              printerSettings: data.printerSettings || defaultPrinterSettings,
              nextOrderNumber: data.nextOrderNumber || 1,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'restocore-storage',
    }
  )
);
