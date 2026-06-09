import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mediaType:{
        type: String,
        enum: ["image", "video"],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    caption: {
        type: String,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        commentedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true
        }}]   
},{
    timestamps: true
})

const Post = mongoose.model("Post", PostSchema);

export default Post;