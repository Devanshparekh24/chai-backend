import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";


const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken(); // Corrected method name
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error || "Failed to generate tokens");
    }
};



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

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// const regis = asyncHandler(async (req, res) => {

//     const { fullName, email, username, coverImage, avatar, password } = req.body;

//     if (
//         [fullName, email, username, coverImage, avatar, password].some(filed => filed?.trim())
//     ) {
//         Error
//     }

//     const existingUser = await User.findOne({
//         $or: [{ email }, { username }]
//     })
//     if (existingUser) {
//         Error
//     }

//     avatarLocalPath = req.files?.avatar?.[0].path;
//     coverImage = req.files?.coverImage?.[0].path;

//     if (!avatarLocalPath) {
//         Error
//     }

//     const user = await User.create({
//         _id,
//         username: username.toLowercase(),
//         coverImage: coverImage || "",
//         avatar: avatar.url,
//         email,
//         password

//     })


//     const createdUser = await User.findOne(user._id).select("-password -refrenceToken")

//     if (!createdUser) {
//         Error
//     }
// return res
// .status(200)
// .json(new ApiResponse (201,createdUser,"dsm"))

// })


// const loginUser = asyncHandler(async (req, res) => {
//     // req body -> data
//     // username or email
//     //find the user
//     //password check
//     //access and referesh token
//     //send cookie

//     const { email, username, password } = req.body


//     if (!username && !email) {
//         throw new ApiError(400, "username or email is required")
//     }


//     // Here is an alternative of above code based on logic discussed in video:
//     // if (!(username || email)) {
//     //     throw new ApiError(400, "username or email is required")

//     // }

//     const user = await User.findOne({
//         $or: [{ username }, { email }]
//     })

//     if (!user) {
//         throw new ApiError(404, "User does not exist")
//     }

//     const isPasswordValid = await user.isPasswordCorrect(password)

//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid user credentials")
//     }

//     console.log(generateAccessAndRefereshTokens);


//     const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//     console.log(email);

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res

//         .status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     user: loggedInUser, accessToken, refreshToken
//                 },
//                 "User logged In Successfully"

//             )

//         )

// })

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or password is required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    const isPasswordCorrectValid = await user.isPasswordCorrect(password);
    if (!isPasswordCorrectValid) {
        throw new ApiError(401, "Invalid user credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    );

    const loggedInUser = await User
        .findById(User._id)
        .select("-password -refreshToken");

    const option = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});


const loggOutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {

            $set: {
                refrenceToken: undefined
            }
        }, {
        new: true
    }
    )
    const options = {

        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refrenceToken", options)
        .json(
            new ApiResponse(200, "User loggout Successfully")
        )
})

const refreshToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refrenceToken || req.body.refrenceToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "UnAuthroize req")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRECT,
            process.env.RERESH_TOKEN,

        )
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refrence Token")

        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token")

        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

            .status(200)
            .cookies("accessToken", accessToken)
            .cookies("newRefreshToken", newRefreshToken)
            .json(
                new ApiResponse(


                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Accesss Token successully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invaild Token")
    }

})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body


    const user = await User.findById(req.user?._id)

    const isCorrctPassword = user.isPasswordCorrect(oldPassword)
    if (!isCorrctPassword) {
        throw new ApiError(401, "password is Incorrect")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password change successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, "Current User Successully")

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(401, "FullName or email is require")

    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:
                fullName,
            email
        },
        { new: true }




    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details successfully"))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // You likely need to upload the file to a storage service and get a URL.
    // Assuming you have an upload function that returns an avatar URL:
    const avatarUrl = await uploadToCloud(avatarLocalPath); // Placeholder function

    if (!avatarUrl) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avtar filed are Successfully updated                                                                                                   "))

});


const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // You likely need to upload the file to a storage service and get a URL.
    // Assuming you have an upload function that returns an avatar URL:
    const coverImage = await uploadToCloud(avatarLocalPath); // Placeholder function

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "CoverImage is updated "))

});


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw ApiError(400, "username is missing")

    }

    const channel = await User.aggregate([

        {
            $match: {
                username: username?.toLowerCase()

            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel ",
                as: "subscriber"
            }
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber ",
                as: "subscriberTO"
            }
        }, {
            $addFields: {
                subscriberCount: {
                    channelSubscribeToCount: {
                        $size: "$subscriberTO"
                    }
                },
                isSubscribe: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscriptions.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelSubscribeToCount: 1,
                isSubscribe: 1,
                avatar: 1,
                email: 1,
                coverImage: 1,

            }
        }
    ])
    console.log("Channel", channel);
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exists")

    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "user channel fetched")
        )

})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }, {
                        $addFields: {
                            $owner: {
                                $first: "owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse
            (200, user[0].watchHistory, "Watch history fetched successfully")
        );
});

export {
    registerUser,
    getUserChannelProfile,
    loginUser,
    loggOutUser,
    refreshToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getWatchHistory
}