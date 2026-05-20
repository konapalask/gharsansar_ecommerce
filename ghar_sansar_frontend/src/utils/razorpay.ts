// Razorpay utility functions

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve();
    };
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async (options: {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  handler: (response: any) => void;
  onError?: (error: any) => void;
}) => {
  await loadRazorpay();

  const razorpayOptions = {
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    name: 'Ghar Sansar',
    description: options.description,
    order_id: options.orderId,
    prefill: options.prefill,
    handler: options.handler,
    theme: {
      color: '#2563eb'
    },
    modal: {
      ondismiss: () => {
        console.log('Payment modal closed');
      }
    }
  };

  const razorpay = new window.Razorpay(razorpayOptions);
  
  razorpay.on('payment.failed', (response: any) => {
    console.error('Payment failed:', response);
    if (options.onError) {
      options.onError(response);
    }
  });

  razorpay.open();

  return razorpay;
};

