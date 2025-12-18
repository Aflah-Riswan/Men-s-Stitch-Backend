import * as uploadService from '../services/uploadService.js';

export const uploadSingleFile = async (req, res, next) => {
  try {
    const file = req.file;
    const response = await uploadService.uploadSingleFileService(file);
    
    return res.status(201).json({ 
      success: true, 
      imageUrl: response.imageUrl 
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleFiles = async (req, res, next) => {
  try {
    const files = req.files;
    const response = await uploadService.uploadMultipleFileService(files);
    return res.status(200).json({ 
      success: true, 
      urlCollection: response.urlCollections 
    });
  } catch (error) {
    console.error("Error in multiple file upload controller:", error);
    next(error);
  }
};