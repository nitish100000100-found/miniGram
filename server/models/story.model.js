import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mediaType: {
        type: String,
        enum: ["image", "video"],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    deleteAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
    }
}, {
    timestamps: true
});

storySchema.index(
    { deleteAt: 1 },
    { expireAfterSeconds: 0 }
);

const Story = mongoose.model("Story", storySchema);

export default Story;