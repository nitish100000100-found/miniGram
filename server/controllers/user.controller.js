import User from "../models/user.model.js";
import mongoose from "mongoose";
import path from "path";
import { uploadToCloudinary, cloudinary } from "../config/cloudinary.js";
import Post from "../models/post.model.js";
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found !" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const suggestedUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(req.userId) },
        },
      },
      {
        $sample: { size: 20 },
      },
    ]);

    return res.status(200).json({ users });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const editProfile = async (req, res, next) => {
  let uploadedPublicId = null;

  try {
    const { username: givenByUser, bio, profession, gender, name } = req.body;

    const username = givenByUser?.trim().toLowerCase();
    if (username === "") {
      return res.status(400).json({
        message: "Username cannot be empty",
      });
    }
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }
    }

    const oldPublicId = user.public_id;

    if (req.file) {
      const originalName = path.parse(req.file.originalname).name;

      const cleanName = originalName
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "");

      const uniqueName = `${
        username || user.username
      }_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}_${cleanName}`;

      const result = await uploadToCloudinary(req.file.buffer, uniqueName);

      uploadedPublicId = result.public_id;

      user.profilePicture = result.secure_url;
      user.public_id = result.public_id;
    }

    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (profession !== undefined) user.profession = profession;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    if (req.file && oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (err) {
        console.error("Failed to delete old profile picture:", err.message);
      }
    }

    const updatedUser = await User.findById(req.userId).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch (err) {
        console.error("Failed to rollback cloudinary upload:", err.message);
      }
    }

    next(error);
  }
};

const lookFor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const profileUser = await User.findById(id)
      .select("-password")
      .populate("posts");

    if (!profileUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentUserId = req.userId;

    const isFollowing = profileUser.followers.some(
      (followerId) => followerId.toString() === currentUserId,
    );

    if (profileUser.isPrivate && !isFollowing) {
      const userData = profileUser.toObject();

      userData.followersLength = profileUser.followers.length;
      userData.followingLength = profileUser.following.length;

      userData.posts = [];
      userData.followers = [];
      userData.following = [];
      userData.savedPosts = [];
      userData.likedPosts = [];
      userData.sendRequest = [];
      userData.receivedRequest = [];
      userData.highlights = [];

      return res.status(200).json(userData);
    }

    return res.status(200).json(profileUser);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export { getCurrentUser, suggestedUsers, editProfile, lookFor };
