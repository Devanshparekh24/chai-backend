import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,  // Ensure correct env variable name
  api_secret: process.env.CLOUDINARY_API_SECRET,  // Fixed typo
});
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,  // Ensure correct env variable name
  api_secret: process.env.CLOUDINARY_API_SECRET,  // Fixed typo
});

// ✅ Upload function
const uploadOnCloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto", // ✅ Fixed typo (removed extra space)
    });

    console.log("✅ File uploaded successfully:", response.url);
    return response;
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);

    // ✅ Only remove file if it exists
    if (fs.existsSync(localFilepath)) {
      try {
        fs.unlinkSync(localFilepath);
        console.log("🗑️ Local file deleted after failed upload.");
      } catch (fsError) {
        console.error("❌ Error deleting local file:", fsError);
      }
    }

    return null;
  }
};

// ✅ Correctly export the function
export { uploadOnCloudinary };
