import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    if ([username, email, fullName, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    // Validate file existence
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;




    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload images to Cloudinary
    let avatar, coverImage;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar?.url) throw new ApiError(400, "Failed to upload avatar");

        coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    } catch (error) {
        throw new ApiError(500, "Error uploading images to Cloudinary");
    }

    // Create user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refrenceToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser }