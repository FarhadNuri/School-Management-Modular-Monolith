import express from 'express';
import { handleStripeWebhook } from './stripe.webhook.js';

const forwardToPaymentService = async (req) => {
  try {
    const paymentServiceUrl = (process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '');
    await fetch(`${paymentServiceUrl}/api/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': req.headers['stripe-signature'] || '',
      },
      body: req.body,
    });
  } catch (err) {
    // Payment service may be starting or on different port — ignore network failure
  }
};

/**
 * Mount all inbound webhook routes.
 *
 * Must be called BEFORE `express.json()` so providers that need a raw body
 * (Stripe signature verification) still receive the unparsed payload.
 */
export const mountWebhooks = (app) => {
  const rawJson = express.raw({ type: 'application/json' });

  const handler = async (req, res, next) => {
    // 1. Forward raw webhook to standalone Payment Microservice (Neon DB + RabbitMQ)
    forwardToPaymentService(req).catch(() => {});

    // 2. Process locally in core backend
    return handleStripeWebhook(req, res, next);
  };

  // Preferred path — all webhooks live under /api/webhooks/*
  app.post('/api/webhooks/stripe', rawJson, handler);

  // Backward-compatible alias used by earlier Stripe CLI / dashboard setups
  app.post('/api/stripe/webhook', rawJson, handler);
};

export default mountWebhooks;
