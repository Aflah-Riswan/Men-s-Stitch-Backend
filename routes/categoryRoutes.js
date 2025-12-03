
const express = require('express')
const { admin, protect } = require('../middlewares/authMiddleware')
const { createCategory, getAllCategories, toggleIsList, getCategoryById } = require('../controllers/categoryController')
const router = express.Router()

router.post('/',protect,admin,createCategory)
router.get('/',getAllCategories)
router.patch('/:id/toggle', protect,admin,toggleIsList)
router.get('/:id/edit',protect,admin,getCategoryById)
module.exports = router