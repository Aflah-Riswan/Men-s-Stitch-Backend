
const express = require('express')
const { validateProduct } = require('../middlewares/validateProducts')
const { createProduct, getProducts, productToggleIsList } = require('../controllers/productController')
const { protect, admin } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/',protect,admin,validateProduct,createProduct)
router.get('/',protect,getProducts)
router.patch('/:id/toggle',protect,admin,productToggleIsList)

module.exports = router