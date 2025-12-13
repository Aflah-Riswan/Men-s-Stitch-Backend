
const express = require('express')
const router = express.Router()
const { admin, protect } = require('../middlewares/authMiddleware')
const { getUsers, blockUser } = require('../controllers/userController')

router.get('/',protect,admin,getUsers)
router.patch('/:id/block',blockUser)

module.exports = router