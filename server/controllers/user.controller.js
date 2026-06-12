import User from "../models/user.model.js";
import mongoose from "mongoose";
import path from "path";
import { uploadToCloudinary, cloudinary } from "../config/cloudinary.js";
import Post from "../models/post.model.js"
import Highlight from "../models/highlight.model.js"
import Story from "../models/story.model.js"
  
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

  
  const user = await User.findById(userId).select("-password").populate({ path: "posts", options: { sort: { createdAt: -1 } } }).populate("highlights");
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
    const currentUser = await User.findById(req.userId).select(
      "following sendRequest blockedUsers",
    );

    const blockedBy = (
      await User.find({
        blockedUsers: req.userId,
      }).select("_id")
    ).map((user) => user._id);

    const excludedUsers = [
      new mongoose.Types.ObjectId(req.userId),
      ...currentUser.following,
      ...currentUser.sendRequest,
      ...currentUser.blockedUsers,
      ...blockedBy,
    ];

    const users = await User.aggregate([
      {
        $match: {
          _id: {
            $nin: excludedUsers,
          },
        },
      },
      {
        $sample: { size: 20 },
      },
      {
        $project: {
          name: 1,
          username: 1,
          profilePicture: 1,
          bio: 1,
          isPrivate: 1,
        },
      },
    ]);

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({
      message: `Internal Server Error: ${error.message}`,
    });
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
    let shouldDeleteOldPic = false;

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
      shouldDeleteOldPic = oldPublicId;
    } else if (req.body.removeProfilePic === "true") {
      user.profilePicture = "";
      user.public_id = "";
      shouldDeleteOldPic = oldPublicId;
    }

    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (profession !== undefined) user.profession = profession;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    if (shouldDeleteOldPic && oldPublicId) {
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
    return res.status(500).json({
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

const switchToPublic = async (req, res) => {
  let session = null;
  try {
    const userId = req.userId;

    session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isPrivate) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Account is already public" });
    }

    // Auto-accept all pending follow requests
    if (user.receivedRequest && user.receivedRequest.length > 0) {
      const requesters = user.receivedRequest;
      for (const reqId of requesters) {
        if (!user.followers.includes(reqId)) {
          user.followers.push(reqId);
        }
        await User.findByIdAndUpdate(
          reqId,
          {
            $addToSet: { following: user._id },
            $pull: { sendRequest: user._id }
          },
          { session }
        );
      }
      user.receivedRequest = [];
    }

    user.isPrivate = false;
    await user.save({ session });
    await session.commitTransaction();

    const updatedUser = await User.findById(userId).select("-password");
    return res.status(200).json({ message: "Account switched to public", user: updatedUser });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

const switchToPrivate = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isPrivate) {
      return res.status(400).json({ message: "Account is already private" });
    }

    user.isPrivate = true;
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");
    return res.status(200).json({ message: "Account switched to private", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
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

    if (req.userId === id) {
      return res.status(400).json({
        message: "You cannot look up your own profile from this API",
      });
    }

    const profileUser = await User.findById(id)
      .select("-password -savedPosts -likedPosts")
      .populate({ path: "posts", options: { sort: { createdAt: -1 } } })
      .populate("highlights");

    if (!profileUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentUser = await User.findById(req.userId).select(
      "blockedUsers following",
    );

    const isBlocked =
      currentUser.blockedUsers.some(
        (userId) => userId.toString() === profileUser._id.toString(),
      ) ||
      profileUser.blockedUsers.some(
        (userId) => userId.toString() === currentUser._id.toString(),
      );

    if (isBlocked) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const commonFollowers = profileUser.followers.filter((followerId) =>
      currentUser.following.some(
        (followingId) => followingId.toString() === followerId.toString(),
      ),
    );

    const commonUsers = await User.find({
      _id: { $in: commonFollowers },
    }).select("_id username profilePicture name");

    const isFollowing = profileUser.followers.some(
      (followerId) => followerId.toString() === req.userId,
    );

    const isRequested = profileUser.receivedRequest.some(
      (reqId) => reqId.toString() === req.userId,
    );

    const hasRequestedMe = profileUser.sendRequest.some(
      (reqId) => reqId.toString() === req.userId,
    );

    const userData = profileUser.toObject();

    delete userData.blockedUsers;
    delete userData.sendRequest;
    delete userData.receivedRequest;

    userData.commonUsers = commonUsers;
    userData.isFollowing = isFollowing;
    userData.isRequested = isRequested;
    userData.hasRequestedMe = hasRequestedMe;
    userData.postsLength = profileUser.posts?.length || 0;

    if (profileUser.isPrivate && !isFollowing) {
      userData.followersLength = profileUser.followers.length;
      userData.followingLength = profileUser.following.length;

      userData.posts = [];
      userData.followers = [];
      userData.following = [];
      userData.highlights = [];

      return res.status(200).json(userData);
    }

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getFollowingStoriesUsers = async (req, res) => {
  try {
    const myId = req.userId;

    const me = await User.findById(myId).select("following");
    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    
    const myActiveStory = await Story.findOne({
      author: myId,
      deleteAt: { $gt: new Date() },
    }).sort({ createdAt: 1 }); 

    const myStoryStatus = myActiveStory ? { hasStory: 1, storyId: myActiveStory._id } : 0;

    
    const activeStories = await Story.find({
      author: { $in: me.following },
      deleteAt: { $gt: new Date() },
    }).sort({ createdAt: 1 });

   
    const followingStoriesMap = {};
    activeStories.forEach((s) => {
      const authorId = s.author.toString();
      if (!followingStoriesMap[authorId]) {
        followingStoriesMap[authorId] = s._id;
      }
    });

   
    const followingUsersWithStories = await User.find({
      _id: { $in: Object.keys(followingStoriesMap) },
    }).select("username profilePicture name");

    const usersList = followingUsersWithStories.map((user) => ({
      _id: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      name: user.name,
      storyId: followingStoriesMap[user._id.toString()],
    }));

    return res.status(200).json([myStoryStatus, ...usersList]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(id).populate({
      path: "followers",
      select: "_id username name profilePicture",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const currentUser = await User.findById(req.userId).select("blockedUsers following");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isBlocked =
      currentUser.blockedUsers.some(
        (uId) => uId.toString() === user._id.toString(),
      ) ||
      user.blockedUsers.some(
        (uId) => uId.toString() === currentUser._id.toString(),
      );

    if (isBlocked) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check privacy
    if (user.isPrivate && req.userId !== id) {
      const isFollowing = user.followers.some(
        (f) => f._id.toString() === req.userId,
      );
      if (!isFollowing) {
        return res.status(403).json({ message: "Private account" });
      }
    }

    return res.status(200).json({
      username: user.username,
      followers: user.followers || [],
      currentUserId: req.userId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(id).populate({
      path: "following",
      select: "_id username name profilePicture",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    const currentUser = await User.findById(req.userId).select("blockedUsers following");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isBlocked =
      currentUser.blockedUsers.some(
        (uId) => uId.toString() === user._id.toString(),
      ) ||
      user.blockedUsers.some(
        (uId) => uId.toString() === currentUser._id.toString(),
      );

    if (isBlocked) {
      return res.status(404).json({ message: "User not found" });
    }

    
    if (user.isPrivate && req.userId !== id) {
      const targetUser = await User.findById(id).select("followers");
      const isFollowing = targetUser.followers.some(
        (fId) => fId.toString() === req.userId,
      );
      if (!isFollowing) {
        return res.status(403).json({ message: "Private account" });
      }
    }

    return res.status(200).json({
      username: user.username,
      following: user.following || [],
      currentUserId: req.userId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export {
  getCurrentUser,
  suggestedUsers,
  editProfile,
  lookFor,
  getFollowingStoriesUsers,
  switchToPublic,
  switchToPrivate,
  getFollowers,
  getFollowing,
};
