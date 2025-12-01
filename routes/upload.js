
const express = require('express')
const router = express.Router()
const {upload,s3 }= require('../middlewares/configAws')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')


router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: ' no file uploaded' })
    const fileName = `${Date.now()}-${file.originalname}`
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    }
    const command = new PutObjectCommand(params)
    await s3.send(command)
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.log("error found in upload : ",error)
  }
})

module.exports = router