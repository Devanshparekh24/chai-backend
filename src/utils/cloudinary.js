import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

(async function () {

    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

        api_key: process.env.CLOUDINARY_CLOUD_API_KEY,

        api_secret: process.env.CLOUDINARY_CLOUD_SECRECT_KEY // Click 'View API Keys' above to copy your API secret

    });


    const uploadOnCloudinary = async (localFilepath) => {

        try {
            if (!localFilepath) return null
            //upload on file coludinary
            const response = await cloudinary.uploader.upload(localFilepath, {
                resource_type: "auto "
            })

            console.log("File upload on Cloudinary", response.url);
            return response

        } catch (error) {
            fs.unlinkSync(localFilepath)//Remove the locally save Temporary file file as operation
            return null

        }
    }




    














    // Upload an image 
    // const uploadResult = await cloudinary.uploader
    //     .upload(
    //         'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //         public_id: 'shoes',
    //     }
    //     )
    //     .catch((error) => {
    //         console.log(error);
    //     });

    // console.log(uploadResult);

    // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });

    console.log(optimizeUrl);

    // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });

    console.log(autoCropUrl);
})();