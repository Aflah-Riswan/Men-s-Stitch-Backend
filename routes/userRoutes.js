
const express = require('express')
const router = express.Router()
const { admin, protect } = require('../middlewares/authMiddleware')
const { getUsers, blockUser, getCustomerAnalytics } = require('../controllers/userController')

router.get('/',protect,admin,getUsers)
router.get('/analytics', getCustomerAnalytics)
router.patch('/:id/block',blockUser)

module.exports = router