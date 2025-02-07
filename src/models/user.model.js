import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
            trim: true,
        },
        avata: {
            type: String, //cloudaniry url
            required: true,


        },
        coverImage: {
            type: String, //cloudaniry url


        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "password is Required"]
        },
        refrenceToken: {
            type: String
        }

    },


    { timestamps: true }

)

// save karta phela password ne encrypt krva 
userSchema.pre("save",async function(next){
    if (!this.isModified("password")) {
        return next()
    }
    this.password=bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.isPasswordCorrect=async function (password) {
   return await bcrypt.compare(password,this.password);
    
}

userSchema.methods.genrateAccessToken=  function(){
   return  jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN,

        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
userSchema.methods.genraterefrenceToken= async function(){

    return  jwt.sign(
        {
            _id:this._id,
           
        },
        process.env.RERESH_TOKEN,

        {
            expiresIn:process.env.RERESH_TOKEN_EXPIRY
        }

    )
}

export const User = mongoose.model("User", userSchema);



