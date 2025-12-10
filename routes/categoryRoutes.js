
const express = require('express')
const { admin, protect } = require('../middlewares/authMiddleware')
const { createCategory, getAllCategories, toggleIsList, getCategoryBySlug, updateCategory, deleteCategory } = require('../controllers/categoryController')
const validateCategory = require('../middlewares/validateCategory')
const router = express.Router()

router.post('/',protect,admin,validateCategory,createCategory)
router.get('/',getAllCategories)
router.patch('/:id/toggle', protect,admin,toggleIsList)
router.get('/:slug/edit',protect,admin,getCategoryBySlug)
router.put('/:slug/edit',protect,admin,validateCategory,updateCategory)
router.patch('/:id/delete',protect,admin,deleteCategory)
module.exports = router 