/**
 * Hoodpay Payment Integration
 * 
 * This module handles the integration with Hoodpay API for cryptocurrency payments.
 * Documentation: https://support.hoodpay.io/en/articles/7546154-developer
 */

export interface HoodpayConfig {
  business_id: string;
  api_key: string;
  webhook_secret: string;
  currency: string;
  test_mode: boolean;
}

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  customer_email?: string;
  customer_ip?: string;
  customer_user_agent?: string;
  redirect_url?: string;
  notify_url?: string;
}

export interface HoodpayPayment {
  id: string;
  business_id: string;
  amount: number;
  currency: string;
  status: string;
  checkout_url: string;
  created_at: string;
}

export interface HoodpayWebhookEvent {
  type: 'payment:completed' | 'payment:cancelled' | 'payment:expired' | 'payment:method_selected' | 'payment:created';
  data: {
    id: string;
    business_id: string;
    amount: number;
    currency: string;
    status: string;
    customer_email?: string;
    metadata?: any;
  };
}

/**
 * Create a payment in Hoodpay
 */
export async function createHoodpayPayment(
  config: HoodpayConfig,
  params: CreatePaymentParams
): Promise<HoodpayPayment> {
  const apiUrl = config.test_mode
    ? 'https://api-test.hoodpay.io/v1/payments'
    : 'https://api.hoodpay.io/v1/payments';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      business_id: config.business_id,
      amount: params.amount,
      currency: params.currency,
      name: params.name,
      description: params.description,
      customer_email: params.customer_email,
      customer_ip: params.customer_ip,
      customer_user_agent: params.customer_user_agent,
      redirect_url: params.redirect_url,
      notify_url: params.notify_url,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Hoodpay API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Get payment details from Hoodpay
 */
export async function getHoodpayPayment(
  config: HoodpayConfig,
  paymentId: string
): Promise<HoodpayPayment> {
  const apiUrl = config.test_mode
    ? `https://api-test.hoodpay.io/v1/payments/${paymentId}`
    : `https://api.hoodpay.io/v1/payments/${paymentId}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Hoodpay API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Cancel a payment in Hoodpay
 */
export async function cancelHoodpayPayment(
  config: HoodpayConfig,
  paymentId: string
): Promise<void> {
  const apiUrl = config.test_mode
    ? `https://api-test.hoodpay.io/v1/payments/${paymentId}/cancel`
    : `https://api.hoodpay.io/v1/payments/${paymentId}/cancel`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Hoodpay API error: ${error.message || response.statusText}`);
  }
}

/**
 * Verify webhook signature from Hoodpay
 */
export function verifyHoodpayWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  // Hoodpay uses HMAC SHA256 for webhook signatures
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Parse Hoodpay webhook event
 */
export function parseHoodpayWebhook(payload: any): HoodpayWebhookEvent {
  return {
    type: payload.type,
    data: payload.data,
  };
}

/**
 * Create an order in Hoodpay (simplified wrapper)
 */
export async function createHoodpayOrder(params: {
  apiKey: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}): Promise<{ id: string; payment_url: string }> {
  // Build description from items
  const description = params.items
    .map(item => `${item.productName} x${item.quantity}`)
    .join(', ');

  const apiUrl = 'https://api.hoodpay.io/v1/payments';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      name: params.customerName || params.customerEmail,
      description: description,
      customer_email: params.customerEmail,
      redirect_url: `${process.env.FRONTEND_URL || 'https://licencias-software-production.up.railway.app'}/order-success`,
      notify_url: `${process.env.BACKEND_URL || 'https://licencias-software-production.up.railway.app'}/api/webhooks/hoodpay`,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(`Hoodpay API error: ${error.message || response.statusText}`);
  }

  const payment = await response.json();
  return {
    id: payment.id,
    payment_url: payment.checkout_url,
  };
}
