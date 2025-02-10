import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db/index.js'; // Ensure this file exists and exports connectDB
dotenv.config('./.env'); // Ensure environment variables are loaded
// Initialize Express app
import {app} from "./app.js" /// test
const port = process.env.PORT || 8000;

// Connect to MongoDB and start the server
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed!", err);
    });
