require("dotenv").config();
const express = require('express')
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes =require('./routes/authRoutes')
const cookieParser = require("cookie-parser");
const uploadRoutes = require('./routes/upload')
const categoryRoutes = require('./routes/categoryRoutes')
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')
const app = express()
connectDB()
console.log("index.js loaded")
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true,
  methods:['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders:['Content-Type','Authorization']
}));
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth',authRoutes)
app.use('/api',uploadRoutes)
app.use('/api/categories',categoryRoutes)
app.use('/api/products',productRoutes)
app.use('/api/users',userRoutes)


app.listen(3000, () => console.log('server is running..'))