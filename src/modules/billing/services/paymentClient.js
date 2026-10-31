import ENV from '../../../config/env.js';

const getPaymentServiceUrl = () => {
  return (process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '');
};

class PaymentServiceClient {
  constructor() {
    this.baseUrl = getPaymentServiceUrl();
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || data.message || `Payment service returned ${res.status}`);
      err.statusCode = res.status;
      throw err;
    }

    return data;
  }

  async createInvoice(payload) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPayments(query = {}) {
    const qs = new URLSearchParams(query).toString();
    return this.request(`/api/payments${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async getPaymentById(id) {
    return this.request(`/api/payments/${id}`, { method: 'GET' });
  }

  async updatePayment(id, payload) {
    return this.request(`/api/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async createCheckout(id) {
    return this.request(`/api/payments/${id}/checkout`, { method: 'POST' });
  }

  async confirmCheckoutSession(sessionId) {
    return this.request(`/api/payments/checkout-session/${sessionId}`, { method: 'GET' });
  }

  async syncPayment(id) {
    return this.request(`/api/payments/${id}/sync`, { method: 'POST' });
  }

  async resendInvoice(id) {
    return this.request(`/api/payments/${id}/resend`, { method: 'POST' });
  }

  async cancelPayment(id) {
    return this.request(`/api/payments/${id}/cancel`, { method: 'POST' });
  }
}

const paymentClient = new PaymentServiceClient();
export default paymentClient;

