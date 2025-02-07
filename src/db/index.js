import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from '../constant.js';

dotenv.config(); // Ensure environment variables are loaded

const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        console.log("MongoDB URL:", process.env.MONGODB_URL);
        console.log("Database Name:", DB_NAME);

        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in .env file");
        }

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\nMongoDB connected! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1);
    }
};

export default connectDB;
