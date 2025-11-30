
const express = require('express')
const multer = require('multer')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const router = express.Router()

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
})
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

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