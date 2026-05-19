# BhaoBhao — Enterprise-Grade Monorepo Pet Services Platform

BhaoBhao is a production-grade, highly scalable multi-portal SaaS platform designed for scheduling, routing, and auditing professional, in-home pet grooming services. It comprises five core applications operating in a decoupled, microservices-adjacent monorepo architecture, catering to customers, service providers (groomers), and operational administrators.

This repository demonstrates **Full-Stack Engineering** coupled with professional **Cloud DevOps Practices**, featuring high-performance React SPAs, a structured relational schema managed with Drizzle ORM, secure token-based authentication, persistent background cron daemons, and zero-downtime multi-server hosting topologies.

---

## 🏗️ System Architecture & Data Flow

Below is the dynamic system architecture diagram showing the micro-frontend monorepo structure, dynamic routing gateways, Express API orchestrator, and secure database layers:

```mermaid
graph TD
    %% Styling Definitions
    classDef client fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef gateway fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef backend fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#fff;
    classDef db fill:#064e3b,stroke:#059669,stroke-width:2px,color:#fff;
    classDef external fill:#1e293b,stroke:#475569,stroke-width:1px,color:#94a3b8;

    %% Nodes
    A[Public Landing Page<br/>bhao-bhao.vercel.app]:::client
    B[Customer Portal<br/>bhaobhao-customer.vercel.app]:::client
    C[Groomer Portal<br/>bhaobhao-groomer.vercel.app]:::client
    D[Admin Portal<br/>bhaobhao-admin.vercel.app]:::client

    G[Recruiter Gateway Header<br/>One-Click Demo Router]:::gateway

    H[Node.js Express API Server<br/>Render Container]:::backend
    I[node-cron Background Daemon]:::backend

    J[(Neon Serverless PostgreSQL)]:::db
    K[Drizzle Database Schema]:::db

    L[Mailgun OTP Engine]:::external
    M[Supabase S3 Assets]:::external

    %% Connections
    A -->|Includes| G
    G -->|Launches| B
    G -->|Launches| C
    G -->|Launches| D

    B -->|REST Requests + JWT| H
    C -->|REST Requests + JWT| H
    D -->|REST Requests + JWT| H

    H -->|Query & Schema Migrations| J
    J -->|Backed by| K

    H -->|Email Verification| L
    H -->|Image Caching| M
    H -->|Schedules| I
```

---

## 🔐 Recruiter Sandbox Mode & Evaluation Guide

To allow recruiters, hiring managers, and portfolio evaluators to thoroughly explore the platform in under **30 seconds** without requiring SMS API costs or active email integrations, a robust **`PORTFOLIO_DEMO_MODE`** flag is built directly into the core controllers.

### 🌟 Quick-Bypass Sandbox Credentials
You can evaluate all three custom portals instantly with zero setup:

| Portal | URL | Demo Login Credentials | Dynamic Interceptions |
|---|---|---|---|
| **👤 Public Site** | `https://bhao-bhao.vercel.app` | *Explore the Gateway at the very top!* | N/A |
| **👤 Customer Portal** | `https://bhaobhao-customer.vercel.app/booking` | Enter your own mobile/email ➡️ OTP: **`123456`** | Auto-authenticates and navigates right to Booking! |
| **✂️ Groomer Portal** | `https://bhaobhao-groomer.vercel.app` | Phone: **`9663176108`** (John Doe) ➡️ OTP: **`123456`** | Displays active scheduled booking cards and live dashboard counts! |
| **⚙️ Admin Portal** | `https://bhaobhao-admin.vercel.app` | Username: **`admin`** ➡️ Password: **`admin`** | Provides full database control, pet listings, and service approvals! |

---

## 🏗️ Dual-Hosting Topologies

The codebase is engineered to support dual target environments, showing both **production-grade enterprise networks** and **cost-effective live portfolio hosting**:

### 1. Enterprise Production Topology (AWS + Nginx + PM2)
In the real-world production setup, BhaoBhao is hosted on a secured cloud network engineered for low latency, secure data transit, and high availability:
*   **Reverse Proxy & SSL Termination**: A centralized **Nginx** server terminates SSL/TLS certificates generated via Let's Encrypt, managing HTTP-to-HTTPS redirection, serving static SPA assets directly from the disk for near-zero latency, and proxying active web sockets.
*   **Daemon Process Management**: The Node.js Express server is managed using **PM2** in cluster mode, ensuring automatic restarts on failure, CPU core utilization, log rotation, and zero-downtime hot-reloads (`pm2 reload`).
*   **Stateful Cron Scheduling**: A persistent daemon is required because the backend executes stateful background services (using `node-cron`) to run regular database cleanup, process expired reservation slots, and trigger booking reminders.

### 2. Live Portfolio Demo Topology (Vercel + Render + Neon)
To deliver an instantly verifiable, zero-maintenance live demonstration without running active EC2 billing, the project is structured to deploy smoothly on serverless and PaaS edge networks:
*   **Vercel Monorepo Hooks**: Each frontend SPA is configured using Vercel's **Root Directory** workspace configuration. This enables separate build steps, deployment previews, and isolated environment variables for all four clients.
*   **Express API Container on Render**: The backend is hosted on Render as a persistent web service. This ensures that background cron schedulers (`node-cron`) remain continuously operational and do not shut down (which would happen under standard stateless serverless environments like Vercel Functions).
*   **Serverless SQL Database**: Managed PostgreSQL via **Neon.tech**, providing low latency, automated connection pooling, and 100% compatibility with Drizzle ORM pushing.

---

## 🛠️ Advanced DevOps & Engineering Enhancements

The codebase contains several production-level architectural configurations:

### 1. Self-Healing DevOps API Middleware
To eliminate environment mismatches across Render and local dev spaces, the backend's API middleware ([verifyApiKey.js](backend/middlewares/verifyApiKey.js)) features a self-healing fallback that checks both `API_KEYS` and `API_KEY` (singular) automatically:
```javascript
const verifyApiKey = (req, res, next) => {
  const incomingKey = req.headers['x-api-key'];
  const configuredKeys = process.env.API_KEYS || process.env.API_KEY;
  
  if (!incomingKey || !configuredKeys?.includes(incomingKey)) {
    return res.status(403).json({ error: "Access Denied: Invalid API Key" });
  }
  next();
};
```

### 2. SPA Routing Rewrite Configurations (`vercel.json`)
To prevent client-side React Router navigation from breaking (throwing 404s on page refresh) on Vercel, each frontend workspace features a unified router rewrite rule mapping all routes cleanly to `/index.html`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3. Analytics Controller Bypass in Demo Mode
To ensure recruiters see fully populated statistics on the Groomer Dashboard (even with mock data), the analytics compiler in [backend/controllers/analytics.js](backend/controllers/analytics.js) dynamically ignores the strict `groomer_id` constraint when in `PORTFOLIO_DEMO_MODE === "true"`, dynamically matching the dashboard cards count to **`6`** automatically:
```javascript
const groomerIdCondition = process.env.PORTFOLIO_DEMO_MODE === 'true' 
  ? sql`1=1` 
  : eq(bookings.groomerId, groomerId);
```

### 4. Dynamic Auto-Complete Breeds API
Rather than serving static front-end assets, pet registrations on the customer app dynamically query `/breeds/popular` directly from the Neon PostgreSQL database through Drizzle's dynamic relational schema.

---

## ⚙️ DevOps Configurations

### 1. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/bhaobhao`)
This production file serves static React SPA assets, forwards uploads directly, maps reverse proxies, and enforces SSL headers.
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name bhaobhao.in app.bhaobhao.in admin.bhaobhao.in groomer.bhaobhao.in;
    return 301 https://$host$request_uri;
}

# Customer App & API Server
server {
    listen 443 ssl http2;
    server_name app.bhaobhao.in;

    ssl_certificate /etc/letsencrypt/live/bhaobhao.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bhaobhao.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Serve built Vite frontend static files
    root /home/ubuntu/BhaoBhao/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy uploads directly
    location /uploads/ {
        alias /home/ubuntu/BhaoBhao/backend/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Reverse proxy Express API backend
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. PM2 Ecosystem Configuration (`ecosystem.config.json`)
Allows multi-core node cluster management, custom environment injection, logs grouping, and automated clustering.
```json
{
  "apps": [
    {
      "name": "bhaobhao-backend",
      "script": "./app.js",
      "instances": "max",
      "exec_mode": "cluster",
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "1G",
      "env_production": {
        "NODE_ENV": "production",
        "PORTFOLIO_DEMO_MODE": "true",
        "APP_PORT": 5000
      }
    }
  ]
}
```

---

## 📂 Environment Variables Reference

### Backend API Variables (`backend/.env`)
| Key | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-cool-water-123.neon.tech/dbname` | Connection string for Postgres (Neon/RDS) |
| `PORTFOLIO_DEMO_MODE` | `true` | Set to `true` to activate dummy OTP bypass (`123456`) |
| `APP_PORT` | `5000` | Localport the backend API server binds to |
| `JWT_SECRET` | `71GPZZmnf9iwgCvaq54ijRlT6vRa5I...` | Secure signing key for customer/groomer JWT tokens |
| `API_KEYS` | `89dfa480a72e611280022f968e162155_...` | Comma-separated client application validation keys |

### Frontend Variables (`frontend/.env`)
| Key | Example Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://bhaobhao-backend.onrender.com/` | URL of the hosted backend Express API instance |
| `VITE_API_KEY` | `89dfa480a72e611280022f968e162155_...` | API Validation key matching backend's `API_KEYS` |

---

## 🛠️ Step-by-Step Porting & Seeding Runbook

Follow these sequential steps to move the project to Neon and deploy onto PaaS channels securely:

### Phase 1: Database Migration to Neon.tech (Data-Safe)
1.  Create a free PostgreSQL instance at [Neon.tech](https://neon.tech/).
2.  Retrieve the Connection String.
3.  Ensure your schema is pushed to Neon:
    ```bash
    cd backend
    # Modify backend/.env with the new Neon DATABASE_URL
    npm run drizzle:push
    ```
4.  **Replicate Existing SQL Backups (Safe Restoring)**:
    If you have a binary schema/data dump (`.sql` or `.backup`), import it securely without losing anything using `pg_restore`:
    ```bash
    pg_restore --no-owner --no-privileges -d "your-neon-connection-string" database.sql
    ```

### Phase 2: Deploy Backend to Render / Railway
1.  Link your repository to Render or Railway.
2.  Create a new Web Service pointing to the `./backend` directory.
3.  Inject all environment variables (refer to Backend table above), ensuring:
    *   `PORTFOLIO_DEMO_MODE=true`
    *   `DATABASE_URL` matches your Neon production string.
4.  Deploy! The persistent environment will compile dependencies and run `npm start`, keeping background schedulers active.

### Phase 3: Deploy Frontends to Vercel
1.  Connect your repository to Vercel.
2.  Deploy **`frontend`** (Client Portal), **`frontend_landing`** (Landing), **`frontend_admin`** (Admin Panel), and **`frontend_groomer`** (Groomer Panel) as **four separate Vercel projects**.
3.  For each project, configure:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Set to the corresponding folder (e.g. `frontend` or `frontend_groomer`).
    *   **Environment Variables**: Inject `VITE_API_BASE_URL` pointing to your hosted Render backend.
4.  Deploy! Vercel will distribute static SPAs globally on their edge network.
