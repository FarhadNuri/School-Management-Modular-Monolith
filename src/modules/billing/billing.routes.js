import { Router } from 'express';
import {
  createInvoice,
  getPayments as getAdminPayments,
  getPaymentById as getAdminPaymentById,
  updatePayment,
  resendInvoice,
  cancelPayment,
} from './controllers/admin.payment.controller.js';
import {
  getMyPayments,
  confirmCheckoutSession,
  getMyPaymentById,
  checkoutPayment,
  syncMyPayment,
} from './controllers/user.payment.controller.js';
import { admminProtector } from '../auth/middleware/admin.middleware.js';
import { protectUser } from '../auth/middleware/user.middleware.js';

const router = Router();

// ========================
// ADMIN BILLING / PAYMENT ROUTES
// ========================
router.post('/admin/payments', admminProtector, createInvoice);
router.post('/admin/invoices', admminProtector, createInvoice); // alias
router.get('/admin/payments', admminProtector, getAdminPayments);
router.get('/admin/invoices', admminProtector, getAdminPayments); // alias
router.get('/admin/payments/:id', admminProtector, getAdminPaymentById);
router.get('/admin/invoices/:id', admminProtector, getAdminPaymentById); // alias
router.patch('/admin/payments/:id', admminProtector, updatePayment);
router.patch('/admin/invoices/:id', admminProtector, updatePayment); // alias
router.post('/admin/payments/:id/resend', admminProtector, resendInvoice);
router.post('/admin/payments/:id/cancel', admminProtector, cancelPayment);

// ========================
// USER BILLING / PAYMENT ROUTES
// ========================
router.get('/user/payments', protectUser, getMyPayments);
router.get('/user/invoices', protectUser, getMyPayments); // alias
router.get('/user/payments/:id', protectUser, getMyPaymentById);
router.get('/user/invoices/:id', protectUser, getMyPaymentById); // alias
router.post('/user/payments/:id/checkout', protectUser, checkoutPayment);
router.get('/user/payments/checkout-session/:sessionId', protectUser, confirmCheckoutSession);
router.post('/user/payments/:id/sync', protectUser, syncMyPayment);

export default router;
