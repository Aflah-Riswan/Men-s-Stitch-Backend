import * as uploadService from '../services/uploadService.js';

export const uploadSingleFile = async (req, res) => {
  try {
    const file = req.file;
    const response = await uploadService.uploadSingleFileService(file);
    if (response.success) return res.status(201).json({ imageUrl: response.imageUrl });
    else return res.status(400).json(response);
  } catch (error) {
    console.log("errror found in upload single file ", error);
    return res.status(500).json({ success: false, message: error });
  }
};

export const uploadMultipleFiles = async (req, res) => {
  try {
    const files = req.files;
    const response = await uploadService.uploadMultipleFileService(files);
    if (response.success) return res.status(200).json({ success: true, urlCollection: response.urlCollections });
    else return res.status(400).json({ success: false, message: ' failed to upload' });
  } catch (error) {
    console.log("error in multiple file upload controller ", error);  
    return res.status(500).json({ success: false, message: error });
  }
};