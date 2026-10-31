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

const parseOrigins = (val) => {
  if (!val) return [];
  return val.split(",").map(u => u.trim().replace(/\/$/, "")).filter(Boolean);
};

const configuredOrigins = [
  ...parseOrigins(ENV.FRONTEND_URL),
  ...parseOrigins(ENV.ADMIN_URL),
  "https://sunrisems-admin.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const clean = origin.replace(/\/$/, "");
  if (configuredOrigins.includes(clean)) return true;
  // Automatically allow any Vercel deployments (production & branch previews)
  if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(clean)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
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
app.use('/api', authRoutes); // Fallback: resolves /api/user/login, /api/login, /api/admin/login
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
