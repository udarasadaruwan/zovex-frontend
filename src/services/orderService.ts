import { apiRequest } from './apiClient';
import type { CheckoutSession, Order, ShippingAddress } from '../types';

interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  items: Array<{
    product: string;
    quantity: number;
  }>;
}

interface OrderResponse {
  order: Order;
}

interface OrdersResponse {
  orders: Order[];
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const data = await apiRequest<OrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.order;
};

export const createCheckoutSession = async (orderId: string) => {
  const data = await apiRequest<CheckoutSession>('/payments/checkout-session', {
    method: 'POST',
    body: JSON.stringify({ orderId })
  });
  return data;
};

export const confirmCheckoutSession = async (sessionId: string) => {
  const data = await apiRequest<OrderResponse>(`/payments/checkout-session/${sessionId}/success`);
  return data.order;
};

export const getMyOrders = async () => {
  const data = await apiRequest<OrdersResponse>('/orders');
  return data.orders;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const data = await apiRequest<OrderResponse>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return data.order;
};
