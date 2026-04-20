import axios from 'axios';

export const initiatePaystack = async (email: string, amount: number, metadata: any = {}) => {
  try {
    const response = await axios.post('/api/payments/paystack/initialize', {
      email,
      amount,
      metadata
    });
    return response.data;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw error;
  }
};

export const initiateHubtel = async (phone: string, amount: number, itemId: string) => {
  try {
    const response = await axios.post('/api/payments/hubtel/request', {
      phone,
      amount,
      itemId
    });
    return response.data;
  } catch (error) {
    console.error('Hubtel request error:', error);
    throw error;
  }
};
