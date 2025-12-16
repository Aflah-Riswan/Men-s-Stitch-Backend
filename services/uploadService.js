import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/configAws.js";

export const uploadSingleFileService = async (file) => {
  try {
    if (!file) return { success: false, message: ' no file uploaded' };
    
  
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, '-');
    const fileName = `${Date.now()}-${sanitizedOriginalName}`;
    
   
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    };
    
    const command = new PutObjectCommand(params);

   
    await s3.send(command);
    

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return { success: true, imageUrl };
  } catch (error) {
    console.log("error found in upload : ", error);
    return { success: false, message: error };
  }
};

export const uploadMultipleFileService = async (files) => {
  try {
    if (!files || files.length === 0) return { success: false, message: 'no files found' };
    
  
    const uploadPromises = files.map(async (file) => {
      const sanitizedOriginalName = file.originalname.replace(/\s+/g, '-');
      const fileName = `${Date.now()}-${sanitizedOriginalName}`;
      
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
      };
      
    
      await s3.send(new PutObjectCommand(params));
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    });

  
    const urlCollections = await Promise.all(uploadPromises);
    
    return { success: true, urlCollections };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};