import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.connect(process.env.MONGO_URI_PROD as string);
    } else {
      await mongoose.connect(process.env.MONGO_URI_DEV as string);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
