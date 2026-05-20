import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface PaymentContextType {
  initializePayment: (amount: number, currency: string, orderData: any) => Promise<any>;
  verifyPayment: (orderId: string, paymentId: string, signature: string) => Promise<boolean>;
  loading: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePayment must be used within PaymentProvider');
  return context;
};

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  
  // Note: For production, these should be handled by your backend server
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key';
  
  const initializePayment = async (amount: number, currency: string = 'INR', orderData: any) => {
    setLoading(true);
    try {
      // In production, create order on your backend first
      const order = await createOrderOnBackend({
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: orderData
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: RAZORPAY_KEY_ID
      };
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    setLoading(true);
    try {
      // Verify payment with your backend
      const response = await axios.post('/api/payments/verify', {
        orderId,
        paymentId,
        signature
      });
      return response.data.success;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mock function for now - implement on backend
  const createOrderOnBackend = async (data: any) => {
    // TODO: Replace with actual backend API call
    return {
      id: `order_${Date.now()}`,
      amount: data.amount,
      currency: data.currency
    };
  };

  return (
    <PaymentContext.Provider value={{ initializePayment, verifyPayment, loading }}>
      {children}
    </PaymentContext.Provider>
  );
};

