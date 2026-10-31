import express from "express";
import cors from "cors";
import ENV from "./config/env.js";
import connectDB from "./config/database.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

// Domain module routes (Routes live inside individual modules)
import authRoutes from "./modules/auth/auth.routes.js";
import academicsRoutes from "./modules/academics/academics.routes.js";
import gradingRoutes from "./modules/grading/grading.routes.js";
import communicationRoutes from "./modules/communication/communication.routes.js";
import billingRoutes from "./modules/billing/billing.routes.js";

import seedAdmin from "./config/seedAmin.js";
import { mountWebhooks } from "./webhooks/index.js";
import { startRabbitMQConsumer } from "./config/rabbitmq.js";

const app = express();

const allowedOrigins = [
  ENV.FRONTEND_URL,
  ENV.ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean).map(url => url.replace(/\/$/, ""));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true
}));

// Mount inbound webhook routes before express.json() for raw body verification
mountWebhooks(app);

app.use(express.json());
app.use(express.static('public'));

app.use('/api/health', (req, res) => {
  res.status(200).json({
    message: "API is Running",
    architecture: "Modular Monolith (routes inside individual modules)",
    modules: ["auth", "academics", "grading", "communication", "billing"],
    paymentService: process.env.PAYMENT_SERVICE_URL || "http://localhost:5001",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: "OK"
  });
});

// Domain-Based Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/billing', billingRoutes);

app.use(notFound);
app.use(errorHandler);

const startDB = async () => {
  try {
    const conn = await connectDB();
    if (conn.readyState === 1) {
      console.log("😊 Database Connected Successfully");
      await seedAdmin();
      // Start RabbitMQ Event Consumer for inter-service communication
      await startRabbitMQConsumer().catch((err) => {
        console.warn("⚠️ RabbitMQ initialization warning:", err.message);
      });
      app.listen(ENV.PORT, () => {
        console.log(`😊 Main Server Running On Port ${ENV.PORT}`);
        console.log(`📦 Modular Monolith Architecture active: routes mounted directly from individual modules`);
      });
    } else {
      console.log("😭 Database Connection Failed");
    }
    return conn;
  } catch (error) {
    console.log("Fail To Start The Server", error.message);
    process.exit(1);
  }
};

startDB();
