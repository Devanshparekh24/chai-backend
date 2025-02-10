import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({

    videoFile: {

        types: String,
        required: [true, "Video file is Require"],
    },
    title: {
        types: String,
        required: [true, "title is Require"],
    },
    owner: {
        types: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    thumnail: {
        types: String,
        required: [true, "Video file Require thumnail"],
    },
    describtion: {
        type: String,
        required: [true, "Video file  Require describtion"],
    },
    duration: {
        type: Number,
        required: true

    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }

}, { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)