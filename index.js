import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import uploadRoutes from './routes/upload.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js'
import addressRoutes from './routes/addressRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes  from './routes/orderRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import paymentRoutes  from './routes/paymentRoutes.js'
import walletRoutes from './routes/walletRoutes.js'
import salesRoutes from './routes/salesRoutes.js'
const app = express();
const PORT = 3000;


connectDB();

console.log("index.js loaded");


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());



app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons',couponRoutes)
app.use('/api/address',addressRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/orders',orderRoutes)
app.use('/api/wishlist',wishlistRoutes)
app.use('/api/payment',paymentRoutes)
app.use('/api/wallet',walletRoutes)
app.use('/api/sales',salesRoutes)

app.all('*any', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const errorCode = err.errorCode || 'INTERNAL_SERVER_PROBLEM'
  console.log(err.message)
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    errorCode: errorCode,
    message: err.message || 'An Unexpected error found'
  })
})


app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));