import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';




const connectDB = async () => {
    try {

        console.log("Attempting to connect to MongoDB...");
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\nMongoDB connected! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1);
    }
};

export default connectDB;

