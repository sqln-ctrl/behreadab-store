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

const app = express();
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : ['http://localhost:5173','http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

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

app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString(), supabase: !!process.env.SUPABASE_URL, cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
  console.log(`📦 Supabase: ${!!process.env.SUPABASE_URL} | Cloudinary: ${!!process.env.CLOUDINARY_CLOUD_NAME}`);
});
