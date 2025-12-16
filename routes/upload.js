import express from 'express';
import { upload } from '../config/configAws.js';
import { uploadSingleFile, uploadMultipleFiles } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/upload', upload.single('image'), uploadSingleFile);
router.post('/upload-multiple', upload.array('images', 3), uploadMultipleFiles);

export default router;