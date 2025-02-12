import mongoose, { Schema } from "mongoose";


const subscriptionSchema = new mongoose({

    subscriber: {
        type: Schema.Types.ObjectId, // one who is s
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }



}, { timestamps: true })


export const Subscription = mongoose.model("Subscription", subscriptionSchema)