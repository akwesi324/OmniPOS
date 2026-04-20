export type Role = 'admin' | 'manager' | 'cashier';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockLevel: number;
  barcode: string;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  date: string;
  cashierId: string;
  customerId?: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'mobile_money' | 'card';
  paymentStatus: 'pending' | 'completed' | 'failed';
  items: SaleItem[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  date: string;
  status: 'pending' | 'received' | 'cancelled';
  totalAmount: number;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
