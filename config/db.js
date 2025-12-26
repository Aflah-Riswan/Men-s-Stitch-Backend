import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(" DATABASE CONNECTED SUCCESSFULLY " , conn.connection.host);
  } catch (error) {
    console.log(" GOT ERROR IN  DATABASE CONECTION : ", error);
  }
};