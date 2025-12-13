
const express = require('express')
const { getFeaturedReview } = require('../controllers/reviewController')
const router = express.Router()

router.get('/featured',getFeaturedReview)

module.exports = router