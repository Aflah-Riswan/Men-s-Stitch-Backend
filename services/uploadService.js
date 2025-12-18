import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/configAws.js";
import AppError from "../utils/appError.js";

export const uploadSingleFileService = async (file) => {
  if (!file)  throw new AppError('No file uploaded', 400, 'FILE_MISSING');
   
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
};

export const uploadMultipleFileService = async (files) => {
  if (!files || files.length === 0) {
    throw new AppError('No files found for upload', 400, 'FILES_MISSING');
  }

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
};