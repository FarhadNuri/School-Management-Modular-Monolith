# Sunrise Model School - Hybrid Backend Service

A production-grade, enterprise School Management System engineered as a **Hybrid Architecture**: a high-throughput **Modular Monolith** for core academic operations coupled with an autonomous **Payment Microservice** powered by **Event-Driven Architecture (EDA)**.

---

## Architecture Overview: Modular Monolith + Microservice

Modern enterprise systems balance the low latency and developer velocity of monolithic design with the fault isolation and strict compliance of microservices. This platform implements a **Hybrid Microservice Architecture**:

![School Platform Architecture Diagram](./public/School%20Platform%20Architecture%20Diagram.png)

---

## Modular Monolith Domain Architecture

The core backend (`src/modules/`) is organized into **five autonomous domain modules**. Each module encapsulates its own controllers, business logic, Mongoose schemas, utilities, and route definitions without relying on global route directories.

![Modular Monolith Architecture Diagram](./public/Modular%20Monolith%20Architecture%20Diagram.png)

---

## Architectural Principles & Design Patterns

### 1. Polyglot Persistence (MongoDB + PostgreSQL)
Instead of forcing all data into a single database type, the system adheres to **Polyglot Persistence**:
- **MongoDB Atlas (Document Store)**: Houses hierarchical and rapidly evolving educational models (timetables, nested attendance arrays, homework submissions, and syllabus materials).
- **Neon Serverless PostgreSQL (Relational SQL via Prisma)**: Exclusively powers the Payment Microservice, enforcing strict ACID compliance, numeric decimal precision for currency amounts, and relational integrity for financial audit logs.

### 2. Event-Driven Architecture (EDA) via RabbitMQ
The microservice and core monolith communicate asynchronously through **CloudAMQP (RabbitMQ)**:
- **Publisher**: When a payment settles via Stripe Webhook or Checkout Session, the Payment Microservice publishes a `payment.completed` event to the `school.events` topic exchange.
- **Consumer**: The Core Monolith consumes from `school.main.payment_events` with manual acknowledgment (`ack`), unlocks course access, updates student standing, and emails receipts.
- **Fault-Tolerance**: If the main server restarts or experiences downtime, messages remain persisted in the durable queue and are processed upon reconnection with zero data loss.

### 3. Database-per-Service Pattern
The Payment Microservice maintains complete schema autonomy:
- It connects to its own independent database (`DATABASE_URL` pointing to Neon).
- Cross-database SQL/Mongo joins are strictly eliminated.
- Communication between services is mediated exclusively via REST APIs and AMQP events.

---

## Technology Stack

| Layer | Core Modular Monolith (Port 5000) | Payment Microservice (Port 5001) |
|---|---|---|
| **Runtime & Framework** | Node.js (ES Modules), Express.js | Node.js (ES Modules), Express.js |
| **Primary Database** | MongoDB Atlas (Mongoose ODM) | Neon PostgreSQL (Prisma ORM) |
| **Message Broker** | RabbitMQ Consumer (`amqplib`) | RabbitMQ Publisher (`amqplib`) |
| **Authentication & Security** | JWT, Bcrypt, Granular RBAC | Internal Service Calls, Stripe Signatures |
| **Media & Storage** | Cloudinary v2 SDK | Stripe Hosted Storage |
| **Email Delivery** | Nodemailer / Mailtrap / SMTP | Nodemailer / SMTP |

---

## Project Directory Structure

```
├── payment-service/                  # Standalone Payment Microservice (Port 5001)
│   ├── prisma/                       # Prisma Schema & PostgreSQL Migrations
│   │   └── schema.prisma             # Neon PostgreSQL Payment Model
│   ├── src/
│   │   ├── config/                   # Prisma, Stripe, RabbitMQ (CloudAMQP)
│   │   ├── controllers/              # Microservice Payment & Checkout Handlers
│   │   ├── routes/                   # Standalone Payment Routes
│   │   ├── services/                 # Stripe SDK Invoice & Session Services
│   │   ├── utils/                    # Financial Formatters & Email Helpers
│   │   └── webhooks/                 # Raw Stripe Webhook Verification
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── src/                              # Core Modular Monolith (Port 5000)
│   ├── config/                       # MongoDB, RabbitMQ Consumer, Env, Seeder
│   │   ├── database.js               # MongoDB Connection Handler
│   │   ├── env.js                    # Validated Environment Configuration
│   │   ├── rabbitmq.js               # CloudAMQP Event Consumer & Auto-reconnect
│   │   └── seedAmin.js               # Default System Admin Seeder
│   ├── middleware/                   # Cross-Cutting Shared Middlewares
│   │   ├── error.middleware.js       # Centralized Error & 404 Handler
│   │   └── multer.middleware.js      # Multi-file Cloudinary Upload Parser
│   ├── modules/                      # 5 Bounded Context Modules
│   │   ├── academics/                # Classes, Courses, Students, Teachers, Routines, Attendance
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── utils/
│   │   │   └── academics.routes.js   # Mounted at /api/academics
│   │   ├── auth/                     # Authentication & Access Control
│   │   │   ├── controllers/
│   │   │   ├── middleware/           # Admin, Teacher, User RBAC Guards
│   │   │   ├── models/
│   │   │   └── auth.routes.js        # Mounted at /api/auth
│   │   ├── billing/                  # Billing Gateway & Microservice Proxy
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── services/             # HTTP Client to Payment Microservice
│   │   │   └── billing.routes.js     # Mounted at /api/billing
│   │   ├── communication/            # Announcements, Complaints & Notifications
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── utils/                # Multi-transport Email Dispatcher
│   │   │   └── communication.routes.js # Mounted at /api/communication
│   │   └── grading/                  # Examinations, Marks & Subject Gradebooks
│   │       ├── controllers/
│   │       ├── models/
│   │       └── grading.routes.js     # Mounted at /api/grading
│   ├── webhooks/                     # Stripe Webhook Router & Inbound Proxy
│   │   ├── index.js                  # Raw body parser & forwarder
│   │   └── stripe.webhook.js
│   └── index.js                      # Application Bootstrapper & Router Mounts
│
├── .env.example
├── package.json
└── README.md
```

---

## Installation & Setup

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (MongoDB Atlas connection string)
- **Neon Serverless PostgreSQL** database connection
- **CloudAMQP** (or local RabbitMQ instance)
- **Stripe** account & API keys
- **Cloudinary** account

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/FarhadNuri/School-Management.git
cd School-Management

# Install Core Monolith dependencies
npm install

# Install Payment Microservice dependencies
cd payment-service
npm install
npx prisma generate
npx prisma db push
cd ..
```

### 3. Environment Configuration

#### Core Monolith (`.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/school_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
PAYMENT_SERVICE_URL=http://localhost:5001
RABBITMQ_URL=amqps://<user>:<pass>@<host>.cloudamqp.com/<vhost>
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME="School Management System"
```

#### Payment Microservice (`payment-service/.env`):
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://<user>:<pass>@<ep-endpoint>.neon.tech/neondb?sslmode=require"
RABBITMQ_URL=amqps://<user>:<pass>@<host>.cloudamqp.com/<vhost>
STRIPE_API_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
MAIN_APP_URL=http://localhost:5000
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME="School Payment Service"
```

---

## Running the Services

### Terminal 1: Core Modular Monolith (Port 5000)
```bash
npm run dev
```

### Terminal 2: Standalone Payment Microservice (Port 5001)
```bash
cd payment-service
npm run dev
```

---

## 📡 API Endpoints Reference

### 1. Auth Module (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/admin/login` | Public | Admin login & JWT token issue |
| `GET` | `/api/auth/admin/me` | Admin | Fetch authenticated admin details |
| `PATCH` | `/api/auth/admin/password` | Admin | Change admin password |
| `PATCH` | `/api/auth/admin/photo` | Admin | Update admin avatar via Cloudinary |
| `POST` | `/api/auth/user/login` | Public | Student, Teacher, Guardian authentication |
| `GET` | `/api/auth/user/me` | Protected | Fetch current profile |
| `PATCH` | `/api/auth/user/change-password` | Protected | User password self-service update |
| `PATCH` | `/api/auth/user/photo` | Protected | User profile photo update |

### 2. Academics Module (`/api/academics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/academics/admin/dashboard` | Admin | Executive summary metrics & counts |
| `GET` / `POST` | `/api/academics/admin/classes` | Admin | List & create academic classes |
| `GET` / `POST` | `/api/academics/admin/courses` | Admin | Curriculum courses & teacher linkages |
| `GET` / `POST` | `/api/academics/admin/students` | Admin | Student registration with auto-credentials |
| `GET` / `POST` | `/api/academics/admin/teachers` | Admin | Faculty onboarding & subject assignments |
| `GET` / `POST` | `/api/academics/admin/guardians` | Admin | Guardian records & linked wards |
| `GET` / `POST` | `/api/academics/admin/routines` | Admin | Class timetable scheduling |
| `GET` | `/api/academics/teacher/classes` | Teacher | Teacher's assigned class rosters |
| `GET` / `POST` | `/api/academics/teacher/lessons` | Teacher | Publish syllabus & study materials |
| `GET` / `POST` | `/api/academics/teacher/homeworks` | Teacher | Issue homework tasks with due dates |
| `GET` / `PUT` | `/api/academics/teacher/attendance/sections/:id` | Teacher | Daily section attendance roster |
| `GET` | `/api/academics/user/courses` | Student/Guardian | Enrolled course directory |
| `GET` / `POST` | `/api/academics/user/homeworks/:id/submit` | Student | Upload homework documents/images |
| `GET` | `/api/academics/user/routine` | Student/Guardian | Weekly routine & period lookup |

### 3. Grading Module (`/api/grading`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` / `PUT` | `/api/grading/admin/grades/:id` | Admin | Review & publish subject gradebooks |
| `PATCH` | `/api/grading/admin/grades/:id/publish` | Admin | Lock/publish grades for visibility |
| `GET` / `PUT` | `/api/grading/teacher/grades/:classId` | Teacher | Record assessment marks by subject |
| `POST` | `/api/grading/teacher/exams` | Teacher | Schedule examinations & tests |
| `GET` | `/api/grading/user/grades` | Student/Guardian | View calculated grades & performance |

### 4. Communication Module (`/api/communication`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` / `GET` | `/api/communication/admin/announcements` | Admin | Publish role-targeted announcements |
| `GET` / `PATCH` | `/api/communication/admin/complaints/:id/status`| Admin | Track complaint resolution status |
| `POST` | `/api/communication/teacher/announcements`| Teacher | Class-targeted announcements |
| `POST` / `GET` | `/api/communication/user/complaint` | Student/Guardian | File complaints with attachments |

### 5. Billing Module (`/api/billing` & Microservice)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/billing/admin/payments` | Admin | Create invoice in Neon DB & issue Stripe link |
| `GET` | `/api/billing/admin/payments` | Admin | Paginated payment ledger |
| `GET` | `/api/billing/user/payments` | Student/Guardian | Browse invoices & payment receipts |
| `POST` | `/api/billing/user/payments/:id/checkout`| Guardian | Launch Stripe Checkout session |
| `POST` | `/api/webhooks/stripe` | Public | Raw webhook signature listener & forwarder |

---