import amqp from 'amqplib';
import Payment from '../modules/billing/models/payment.model.js';
import mailer from '../modules/communication/utils/Mailer.js';

const EXCHANGE_NAME = 'school.events';
const QUEUE_NAME = 'school.main.payment_events';
const ROUTING_KEY = 'payment.*';

let connection = null;
let channel = null;
let isConnecting = false;

export const startRabbitMQConsumer = async () => {
  if (channel) return channel;
  if (isConnecting) return null;

  const url = process.env.RABBITMQ_URL;
  if (!url) {
    console.warn('⚠️ [Main-RabbitMQ] RABBITMQ_URL not set in .env. Message consumer disabled.');
    return null;
  }

  isConnecting = true;
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    // 1. Assert topic exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // 2. Assert durable queue
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': `${EXCHANGE_NAME}.dlx`,
      },
    });

    // 3. Bind queue to exchange
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    // 4. Set prefetch to 1 for fair dispatch
    await channel.prefetch(1);

    console.log(`🐇 [Main-RabbitMQ] Connected to CloudAMQP. Listening on queue "${QUEUE_NAME}"...`);

    // 5. Consume incoming events
    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;

        try {
          const raw = msg.content.toString();
          const parsed = JSON.parse(raw);
          const routingKey = msg.fields.routingKey;

          console.log(`📥 [Main-RabbitMQ] Received event: ${routingKey}`);

          if (routingKey === 'payment.completed') {
            await handlePaymentCompleted(parsed.data || parsed);
          } else {
            console.log(`ℹ️ [Main-RabbitMQ] Unhandled routing key: ${routingKey}`);
          }

          // Acknowledge successful processing
          channel.ack(msg);
        } catch (err) {
          console.error('❌ [Main-RabbitMQ] Error handling message:', err.message);
          // Negative ack without requeue if unparseable, or requeue once
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );

    connection.on('error', (err) => {
      console.error('❌ [Main-RabbitMQ] Connection error:', err.message);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      console.warn('⚠️ [Main-RabbitMQ] Connection closed. Reconnecting in 5s...');
      channel = null;
      connection = null;
      setTimeout(startRabbitMQConsumer, 5000);
    });

    isConnecting = false;
    return channel;
  } catch (err) {
    console.error('❌ [Main-RabbitMQ] Connection failed:', err.message);
    isConnecting = false;
    setTimeout(startRabbitMQConsumer, 5000);
    return null;
  }
};

/**
 * Handle payment.completed event:
 * 1. Synchronize payment status in MongoDB
 * 2. Send email receipt
 */
const handlePaymentCompleted = async (data) => {
  const { id, stripeInvoiceId, stripePaymentIntentId, amount, currency, studentId, guardianEmail } = data;

  try {
    // Locate the payment record in MongoDB (by Mongo ID or Stripe identifiers)
    let payment = null;
    if (id) {
      payment = await Payment.findById(id).catch(() => null);
    }
    if (!payment && stripeInvoiceId) {
      payment = await Payment.findOne({ stripeInvoiceId }).catch(() => null);
    }
    if (!payment && stripePaymentIntentId) {
      payment = await Payment.findOne({ stripePaymentIntentId }).catch(() => null);
    }

    if (payment) {
      payment.status = 'paid';
      payment.amountPaid = Number(amount) || payment.amount;
      payment.paidDate = new Date();
      if (stripePaymentIntentId) payment.stripePaymentIntentId = stripePaymentIntentId;
      await payment.save();
      console.log(`✅ [Main-RabbitMQ] Synced Payment status to PAID for ID: ${payment._id}`);
    } else {
      console.log(`ℹ️ [Main-RabbitMQ] Payment record not found in Mongo (managed exclusively in Neon/Postgres).`);
    }

    // Send email confirmation if email is available
    const recipient = guardianEmail || (payment && payment.guardianEmail);
    if (recipient) {
      try {
        await mailer.sendEmail({
          to: recipient,
          subject: `Payment Receipt: ${payment?.title || 'School Fee'}`,
          text: `Your payment of ${amount} ${currency || 'USD'} has been received and confirmed.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #16a34a;">Payment Confirmed!</h2>
              <p>Thank you. Your payment has been processed successfully.</p>
              <ul>
                <li><strong>Amount:</strong> ${amount} ${currency || 'USD'}</li>
                <li><strong>Transaction / Receipt:</strong> ${stripePaymentIntentId || id || 'N/A'}</li>
                <li><strong>Status:</strong> Completed (Paid)</li>
                <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              <p>School Management Administration</p>
            </div>
          `,
        });
        console.log(`📧 [Main-RabbitMQ] Sent confirmation receipt to ${recipient}`);
      } catch (emailErr) {
        console.warn(`⚠️ [Main-RabbitMQ] Receipt email failed:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error('❌ [Main-RabbitMQ] Error in handlePaymentCompleted:', err);
    throw err;
  }
};

export default {
  startRabbitMQConsumer,
};

