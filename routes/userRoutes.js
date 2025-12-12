
const express = require('express')
const router = express.Router()
const { admin, protect } = require('../middlewares/authMiddleware')

router.get('/',admin,protect)

module.exports = router