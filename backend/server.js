import dotenv from 'dotenv';
dotenv.config();

import express       from 'express';
import cors          from 'cors';
import morgan        from 'morgan';
import errorHandler  from './middleware/errorHandler.js';
import authRoutes       from './routes/authRoutes.js';
import productRoutes    from './routes/productRoutes.js';
import orderRoutes      from './routes/orderRoutes.js';
import inventoryRoutes  from './routes/inventoryRoutes.js';
import accountingRoutes from './routes/accountingRoutes.js';
import userRoutes       from './routes/userRoutes.js';
import adminRoutes      from './routes/adminRoutes.js';
import discountRoutes   from './routes/discountRoutes.js';
import reviewRoutes     from './routes/reviewRoutes.js';
import settingsRoutes   from './routes/settingsRoutes.js';
import categoryRoutes   from './routes/categoryRoutes.js';

const app = express();

// ── CORS: allow Vercel, localhost, and local network IPs ───────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl, mobile apps, Postman
    const allowed = [
      'https://behreadab-store.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
    ];
    const isLocalIP = /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin);
    if (allowed.includes(origin) || isLocalIP) {
      callback(null, true);
    } else {
      console.warn('[CORS] Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/inventory',  inventoryRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/discounts',  discountRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/settings',   settingsRoutes);
app.use('/api/categories', categoryRoutes);

// ── Health check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'OK', time: new Date().toISOString(),
  supabase:   !!process.env.SUPABASE_URL,
  cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
  mail:       !!process.env.MAIL_USER,
}));

app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀  http://localhost:${PORT}`);
  console.log(`📦  Supabase: ${!!process.env.SUPABASE_URL}`);
  console.log(`📧  Mail:     ${!!process.env.MAIL_USER} (${process.env.MAIL_USER || 'not configured'})`);
});
