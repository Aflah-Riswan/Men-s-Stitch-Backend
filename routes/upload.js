
const express = require('express')
const router = express.Router()
const { upload} = require('../config/configAws')
const { uploadSingleFile, uploadMultipleFiles } = require('../controllers/uploadController')

router.post('/upload', upload.single('image'),uploadSingleFile)
router.post('/upload-multiple',upload.array('images',3),uploadMultipleFiles)
module.exports = router