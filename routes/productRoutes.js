
const express = require('express')
const { validateProduct } = require('../middlewares/validateProducts')
const { createProduct, getProducts, productToggleIsList, getProductById } = require('../controllers/productController')
const { protect, admin } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/',protect,admin,validateProduct,createProduct)
router.get('/',protect,getProducts)
router.patch('/:id/toggle',protect,admin,productToggleIsList)
router.get('/:id/edit',protect,admin,getProductById)


module.exports = router