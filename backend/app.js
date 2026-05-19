import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import chalk from 'chalk';
import fs from 'fs';
import util from "util";

// 🧠 Force logging to always display, even if intercepted
delete console.log;
console.log = (...args) => {
  const message = args
    .map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a))
    .join(' ') + '\n';
  process.stdout.write(message);
  fs.appendFileSync('debug.log', `[${new Date().toISOString()}] ${message}`);
};
console.log('\n✅ Logging forced globally — nothing will be hidden\n');

// get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// middlewares
import { verifyApiKey } from './middlewares/verifyApiKey.js';

// routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import addressRoutes from './routes/addresses.js';
import bookingRoutes from './routes/bookings.js';
import subCategoriesRoutes from './routes/subcategories.js';
import categoriesRoutes from './routes/categories.js';
import filtersRoutes from './routes/filters.js';
import servicesRoutes from './routes/services.js';
import petsRoutes from './routes/pets.js';
import petsTypesRoutes from './routes/petTypes.js';
import petsBreedsRoutes from './routes/petBreeds.js';
import groomersRoutes from './routes/groomers.js';
import slotsRoutes from './routes/slots.js';
import transactionsRoutes from './routes/transactions.js';
import analyticsRoutes from './routes/analytics.js';
import apiRoutes from './routes/api.js';
import breedRoutes from './routes/breedRoutes.js';

import { groomers } from './db/schema/groomers.js';

const app = express();

const allowedOrigins = [
  'https://bhaobhao.in',
  'https://www.bhaobhao.in',
  'https://app.bhaobhao.in',
  'https://groomer.bhaobhao.in',
  'https://admin.bhaobhao.in',
  'http://localhost:2000',
  'http://localhost:3333',
  'http://localhost:2222'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, or local scripts)
    if (!origin) return callback(null, true);
    
    if (
      process.env.PORTFOLIO_DEMO_MODE === "true" ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true,
};
app.use(cors(corsOptions));

// 🧾 Use Morgan for clean logs
app.use(
  morgan((tokens, req, res) => {
    return [
      chalk.green.bold(tokens.method(req, res)),
      chalk.yellow(tokens.url(req, res)),
      chalk.blue(tokens.status(req, res)),
      chalk.magenta(tokens['response-time'](req, res), 'ms'),
    ].join(' ');
  })
);

// 🔓 Serve static files before applying API middleware
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🧭 Global Request Logger — shows every route hit and request body
app.use((req, res, next) => {
  console.log(`🚀 Route hit: ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body || {}).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.set('view engine', 'ejs');

// routes (protected with verifyApiKey)
app.use('/auth', verifyApiKey, authRoutes);
app.use('/profile', verifyApiKey, profileRoutes);
app.use('/addresses', verifyApiKey, addressRoutes);
app.use('/bookings', verifyApiKey, bookingRoutes);
app.use('/categories', verifyApiKey, categoriesRoutes);
app.use('/subCategories', verifyApiKey, subCategoriesRoutes);
app.use('/filters', verifyApiKey, filtersRoutes);
app.use('/services', verifyApiKey, servicesRoutes);
app.use('/pets', verifyApiKey, petsRoutes);
app.use('/petTypes', verifyApiKey, petsTypesRoutes);
app.use('/petBreeds', verifyApiKey, petsBreedsRoutes);
app.use('/groomers', verifyApiKey, groomersRoutes);
app.use('/slots', verifyApiKey, slotsRoutes);
app.use('/transactions', verifyApiKey, transactionsRoutes);
app.use('/analytics', verifyApiKey, analyticsRoutes);
app.use('/api/breeds', breedRoutes);
app.use('/api', apiRoutes);

// 🧨 Global Error Handler — shows any unhandled errors in routes
app.use((err, req, res, next) => {
  console.log('❌ Global error caught:', err);
  res.status(500).json({
    error: 'Something went wrong',
    details: err.message,
    stack: err.stack,
  });
});


console.log = (function (log) {
  return function (...args) {
    log.apply(console, args.map(arg =>
      typeof arg === 'object' ? util.inspect(arg, { colors: true, depth: null }) : arg
    ));
  };
})(console.log);


const PORT = process.env.APP_PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// 🕓 Start scheduled jobs
import './cron/bookingReminders.js';
