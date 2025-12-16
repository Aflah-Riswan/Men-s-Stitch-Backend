import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(" DATABASE CONNECTED SUCCESSFULLY ");
  } catch (error) {
    console.log(" GOT ERROR IN  DATABASE CONECTION : ", error);
  }
};