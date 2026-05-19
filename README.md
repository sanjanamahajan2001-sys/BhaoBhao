# BhaoBhao — On-Demand Pet Grooming Platform

BhaoBhao is a production-grade, highly scalable multi-portal platform designed for booking and managing professional, on-demand pet grooming services. It comprises five core services operating in a decoupled, microservices-adjacent architecture, serving customers, service providers (groomers), and operational administrators.

This project showcases professional **Full Stack Engineering** coupled with enterprise-level **DevOps Practices**, featuring high-performance React frontends, a robust relational schema with Drizzle ORM, secure token-based authentication, persistent background cron schedulers, and zero-downtime multi-server hosting topologies.

---

## 🏗️ Dual-Hosting Architectures

To demonstrate both **enterprise-scale cloud infrastructure** and **modern, cost-effective serverless delivery**, BhaoBhao is designed to document a high-availability production topology alongside a fully functional, live-running portfolio demonstration.

### 1. Enterprise Production Topology (AWS + Nginx + PM2)

In the real-world production setup, BhaoBhao is hosted on a secured cloud network engineered for low latency, secure data transit, and high availability.

```
                    ┌──────────────────────────────────────────────┐
                    │            Route 53 DNS Resolution           │
                    └──────────────────────┬───────────────────────┘
                                           │
                                       HTTPS (443)
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │        Application Load Balancer (ALB)       │
                    └──────────────────────┬───────────────────────┘
                                           │
                                       HTTP (80/443)
                                           │
                                           ▼
            ┌──────────────────────────────────────────────────────────────┐
            │          AWS EC2 Instance (Ubuntu 24.04 LTS)                │
            │                                                              │
            │   ┌──────────────────────────────────────────────────────┐   │
            │   │              Nginx Web Server / Reverse Proxy        │   │
            │   └────────┬──────────────────┬──────────────────┬───────┘   │
            │            │                  │                  │           │
            │       Proxy Pass          Proxy Pass          Static         │
            │      (Port 5000)         (Port 3000)        File Serve       │
            │            │                  │                  │           │
            │            ▼                  ▼                  ▼           │
            │   ┌─────────────────┐ ┌───────────────┐ ┌────────────────┐   │
            │   │  PM2 Process    │ │  Vite/React   │ │  Public Upload │   │
            │   │  Daemon         │ │  Groomer &  │ │  Assets        │   │
            │   │  (API Backend)  │ │  Admin Apps │ │  (Multer)      │   │
            │   └────────┬────────┘ └───────────────┘ └────────────────┘   │
            │            │                                                 │
            └────────────┼─────────────────────────────────────────────────┘
                         │
                      TCP (5432) [Secure VPC Peering]
                         │
                         ▼
            ┌──────────────────────────────────────────────────────────────┐
            │         AWS RDS PostgreSQL Managed Database Instance         │
            └──────────────────────────────────────────────────────────────┘
```

#### DevOps Highlights of AWS Architecture:
*   **Reverse Proxy & SSL**: A centralized **Nginx** server terminates SSL/TLS certificates generated via Let's Encrypt, managing HTTP-to-HTTPS redirection, and serving static SPA assets directly from the disk for near-zero latency.
*   **Daemon Process Management**: The Node.js Express server is managed using **PM2** in cluster mode, ensuring automatic restarts on failure, CPU core utilization, log rotation, and zero-downtime hot-reloads (`pm2 reload`).
*   **Stateful Cron Scheduling**: A persistent daemon is required because the backend executes stateful background services (using `node-cron`) to run regular database cleanup, process expired reservation slots, and trigger booking reminders.
*   **Media Pipeline**: Dynamic multipart/form uploads are handled securely through `multer` disk storage and mapped to static caching layers.

---

### 2. Live Portfolio Demo Topology (Vercel + Render + Neon)

To provide recruiters with an instantly verifiable, zero-maintenance live demonstration without running active EC2 billing, the project is structured to deploy smoothly on serverless and PaaS edge infrastructure.

```
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                 Vercel Edge CDN                                 │
 │                                                                                 │
 │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐  │
 │  │ frontend (Client)│ │ frontend_landing │ │  frontend_admin  │ │  frontend_  │  │
 │  │   Vite/React     │ │    Vite/React    │ │    Vite/React    │ │   groomer   │  │
 │  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘ └──────┬──────┘  │
 └───────────┼────────────────────┼────────────────────┼──────────────────┼────────┘
             │                    │                    │                  │
             └────────────────────┴──────────┬─────────┴──────────────────┘
                                             │
                                         REST / JSON
                                             │
                                             ▼
                 ┌──────────────────────────────────────────────────────┐
                 │       Render / Railway Persistent Cloud Server       │
                 │   - Persistent Node.js container hosting Express     │
                 │   - Keeps Cron Daemon (bookingReminders.js) active   │
                 │   - Handles dynamic file-system upload routes        │
                 └──────────────────────────┬───────────────────────────┘
                                            │
                                        Drizzle ORM
                                            │
                                            ▼
                 ┌──────────────────────────────────────────────────────┐
                 │       Neon.tech Serverless PostgreSQL Database       │
                 │   - Relational store with instant branch migrations  │
                 └──────────────────────────────────────────────────────┘
```

#### DevOps Highlights of Portfolio Architecture:
*   **Multi-Workspace Edge Deployment**: Frontends are configured using Vercel's **Root Directory** monorepo workspace configuration. This enables separate build steps, deployment previews, and isolated environment variables for all four clients.
*   **Dynamic persistent server**: The backend is hosted on Render/Railway as a persistent Docker container. This ensures that background cron schedulers (`node-cron`) remain continuously operational and do not shut down (which would happen under standard stateless serverless environments like Vercel Functions).
*   **Serverless SQL Database**: Managed PostgreSQL via **Neon.tech**, providing low latency, automated connection pooling, and 100% compatibility with Drizzle ORM pushing.

---

## 🔐 Recruiter Demo Mode & OTP Bypass

To allow recruiters, hiring managers, and portfolio visitors to seamlessly test the entire platform without incurring SMS API fees or Mailgun charges, a robust **`PORTFOLIO_DEMO_MODE`** flag is built into the backend controller logic.

### How the Bypass Works (100% DB and Data Safe):
1.  **Environment Flag**: Setting `PORTFOLIO_DEMO_MODE=true` in `backend/.env` tells the Node engine to activate virtual OTP interception.
2.  **Challenge Generation Bypass**: When a customer or groomer requests an OTP (via SMS `/auth/sms_sendOTP` or Email `/auth/mailgun_sendOTP`), the system:
    *   Logs the request directly to the terminal: `[DEMO MODE] Intercepted OTP challenge. Use OTP: 123456`.
    *   Inserts a valid challenge entry directly into the PostgreSQL database using a static hash of the code `123456` to preserve schema constraints and tracking history.
    *   Bypasses Mailgun and RML Connect SMS APIs entirely, avoiding bills and missing key errors.
3.  **Verification Bypass**:
    *   During verification, entering **`123456`** immediately resolves as success. The system updates the DB challenge record as consumed, signs a valid JWT token, and logs the user into their respective dashboard.
4.  **UI Hints**:
    *   Both the Client Customer and Groomer Portals dynamically display responsive Tailwind info banners when in demo mode, instructing visitors to use the code **`123456`** to log in instantly.

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

## 📂 Environment variables Reference

### Backend API Variables (`backend/.env`)
| Key | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-cool-water-123.neon.tech/dbname` | Connection string for Postgres (Neon/RDS) |
| `PORTFOLIO_DEMO_MODE` | `true` | Set to `true` to activate dummy OTP bypass (`123456`) |
| `APP_PORT` | `5000` | Localport the backend API server binds to |
| `JWT_SECRET` | `71GPZZmnf9iwgCvaq54ijRlT6vRa5I...` | Secure signing key for customer/groomer JWT tokens |
| `ADMIN_ID` | `admin` | Hashed admin credential username |
| `ADMIN_PASSWORD_HASH` | `$2b$10$WoxS8NkRIdZgeY...` | Hashed bcrypt password for Admin login portal |
| `API_KEYS` | `89dfa480a72e611280022f968e162155_...` | Comma-separated client application validation keys |

### Frontend Variables (`frontend/.env`)
| Key | Example Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.yourdomain.com/` | URL of the hosted backend Express API instance |
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
    *   **Environment Variables**: Inject `VITE_API_BASE_URL` pointing to your hosted Render backend (e.g. `https://bhaobhao-backend.onrender.com/`).
4.  Deploy! Vercel will distribute static SPAs globally on their edge network.
