require("dotenv").config();
const express = require('express')
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const products = require('./models/products'); 
const app = express()
connectDB()
app.use(cors());
app.get('/', (req, res) => {
  res.send({ message: 'hello world' })
})
app.get('/products', async (req, res) => {
  try {
    const items= await products.find()
    console.log(items)
    res.json({status:'success',products:items})
  } catch (error) {
    res.json({status:'failed',message:error})
  }
  
})
app.listen(3000, () => console.log('server is running..'))