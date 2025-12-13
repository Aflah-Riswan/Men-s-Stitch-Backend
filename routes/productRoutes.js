
const express = require('express')
const { validateProduct } = require('../middlewares/validateProducts')
const { createProduct, getProducts, productToggleIsList, getProductById, updateProduct, deleteProduct, getProductsHome, getProductByIdHome } = require('../controllers/productController')
const { protect, admin } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/',protect,admin,validateProduct,createProduct)
router.get('/',protect,getProducts)
router.get('/products-home',getProductsHome)
router.patch('/:id/toggle',protect,admin,productToggleIsList)
router.get('/:id/edit',protect,admin,getProductById)
router.put('/:id/edit',protect,admin,updateProduct)
router.patch('/:id/delete',protect,admin,deleteProduct)
router.get('/:id/details',getProductByIdHome)

module.exports = router