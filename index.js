require("dotenv").config();
const express = require('express')
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const authRoutes =require('./routes/authRoutes')
const cookieParser = require("cookie-parser");
const uploadRoutes = require('./routes/upload')
const app = express()
connectDB()
console.log("index.js loaded")
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true,
  methods:['GET','POST','PUT','DELETE'],
  allowedHeaders:['Content-Type','Authorization']
}));
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth',authRoutes)
app.use('/api',uploadRoutes)

app.listen(3000, () => console.log('server is running..'))