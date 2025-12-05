
const express = require('express')
const { validateProduct } = require('../middlewares/validateProducts')
const { createProduct } = require('../controllers/productController')
const { protect, admin } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/',protect,admin,validateProduct,createProduct)

module.exports = router