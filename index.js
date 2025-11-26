require("dotenv").config();
const express = require('express')
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const users=require('./models/users')
const authRoutes =require('./routes/authRoutes')
const app = express()
connectDB()
app.use(cors());
app.use(express.json())
app.use('/api/auth',authRoutes)

app.listen(3000, () => console.log('server is running..'))