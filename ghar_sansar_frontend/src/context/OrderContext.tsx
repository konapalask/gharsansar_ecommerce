import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (email: string) => Order[];
  fetchUserOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};

const BACKEND_URL = "http://localhost:5001/api";

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const getUserId = (): string => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        return u.id || u.email || "guest";
      } catch (e) {
        return "guest";
      }
    }
    return "guest";
  };

  const fetchUserOrders = async () => {
    const userId = getUserId();
    if (userId === "guest") {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/orders`, {
        headers: { "user-id": userId }
      });
      setOrders(res.data || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on mount and when user changes in localStorage
  useEffect(() => {
    fetchUserOrders();
  }, []);

  const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
    const userId = getUserId();
    setLoading(true);
    try {
      const payload = {
        customer: orderData.customer!,
        items: orderData.items!,
        subtotal: orderData.subtotal || 0,
        shipping: orderData.shipping || 0,
        tax: orderData.tax || 0,
        total: orderData.total || 0,
        paymentStatus: orderData.paymentStatus || 'paid',
        paymentId: orderData.paymentId || '',
        paymentMethod: orderData.paymentMethod || 'razorpay'
      };

      const res = await axios.post(`${BACKEND_URL}/orders`, payload, {
        headers: {
          "user-id": userId,
          "Content-Type": "application/json"
        }
      });

      if (res.data.success && res.data.order) {
        const order = res.data.order;
        setOrders(prev => [...prev, order]);
        return order;
      }
      return null;
    } catch (error) {
      console.error('Order creation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setLoading(true);
    try {
      // In a real app we'd put this to backend, locally faked for now on state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );
    } catch (error) {
      console.error('Order update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const getUserOrders = (email: string): Order[] => {
    return orders.filter(order => order.customer.email === email);
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading, 
      createOrder, 
      updateOrderStatus, 
      getOrderById,
      getUserOrders,
      fetchUserOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

