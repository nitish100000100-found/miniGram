import mongoose from "mongoose";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

const unblockUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const userId = req.userId;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target User ID is required" });
    }

    const me = await User.findById(userId);
    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    const isBlocked = me.blockedUsers.some(
      (id) => id.toString() === targetUserId.toString(),
    );

    if (!isBlocked) {
      return res.status(400).json({ message: "User is not blocked" });
    }

    me.blockedUsers = me.blockedUsers.filter(
      (id) => id.toString() !== targetUserId.toString(),
    );
    await me.save();

    return res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const blockUser = async (req, res) => {
  let session = null;
  try {
    const targetUserId = req.params.id;
    const userId = req.userId;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target User ID is required" });
    }

    if (targetUserId.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const me = await User.findById(userId).session(session);
    const target = await User.findById(targetUserId).session(session);

    if (!me || !target) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyBlocked = me.blockedUsers.some(
      (id) => id.toString() === targetUserId.toString(),
    );

    if (alreadyBlocked) {
      await session.abortTransaction();
      return res.status(400).json({ message: "User is already blocked" });
    }
    const blockedByTarget = target.blockedUsers.some(
      (id) => id.toString() === userId.toString(),
    );

    if (blockedByTarget) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Action not allowed" });
    }

    me.blockedUsers.push(targetUserId);

    me.followers = me.followers.filter(
      (id) => id.toString() !== targetUserId.toString(),
    );
    me.following = me.following.filter(
      (id) => id.toString() !== targetUserId.toString(),
    );
    target.followers = target.followers.filter(
      (id) => id.toString() !== userId.toString(),
    );
    target.following = target.following.filter(
      (id) => id.toString() !== userId.toString(),
    );

    me.sendRequest = me.sendRequest.filter(
      (id) => id.toString() !== targetUserId.toString(),
    );
    me.receivedRequest = me.receivedRequest.filter(
      (id) => id.toString() !== targetUserId.toString(),
    );
    target.sendRequest = target.sendRequest.filter(
      (id) => id.toString() !== userId.toString(),
    );
    target.receivedRequest = target.receivedRequest.filter(
      (id) => id.toString() !== userId.toString(),
    );

    await me.save({ session });
    await target.save({ session });

    await session.commitTransaction();

    return res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};


const comment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postAuthor = await User.findById(post.author);
    if (!postAuthor) {
      return res.status(404).json({ message: "Post author not found" });
    }

    const me = await User.findById(userId);
    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    // Blocking / Private account checks (except if it is user's own post)
    const isSelf = post.author.toString() === userId.toString();
    if (!isSelf) {
      const isBlocked =
        postAuthor.blockedUsers.some(
          (id) => id.toString() === userId.toString(),
        ) ||
        me.blockedUsers.some(
          (id) => id.toString() === postAuthor._id.toString(),
        );

      if (isBlocked) {
        return res.status(403).json({
          message: "You are blocked by the user or you have blocked the user",
        });
      }

      const isPrivate = postAuthor.isPrivate;
      const isFollowed = postAuthor.followers.some(
        (id) => id.toString() === userId.toString(),
      );

      if (isPrivate && !isFollowed) {
        return res.status(403).json({ message: "Private Account" });
      }
    }

    post.comments.push({ commentedBy: userId, text: text.trim() });
    await post.save();

    // Populate comments.commentedBy
    const populatedPost = await Post.findById(postId).populate(
      "comments.commentedBy",
      "username profilePicture name",
    );

    return res.status(201).json({
      message: "Comment added successfully",
      comments: populatedPost.comments,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.userId;

    if (!postId || !commentId) {
      return res
        .status(400)
        .json({ message: "Post ID and Comment ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (c) => c._id.toString() === commentId.toString(),
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const targetComment = post.comments[commentIndex];

    const isPostAuthor = post.author.toString() === userId.toString();
    const isCommentCreator =
      targetComment.commentedBy.toString() === userId.toString();

    if (!isPostAuthor && !isCommentCreator) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== commentId.toString(),
    );
    await post.save();

    const populatedPost = await Post.findById(postId).populate(
      "comments.commentedBy",
      "username profilePicture name",
    );

    return res.status(200).json({
      message: "Comment deleted successfully",
      comments: populatedPost.comments,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const likePost = async (req, res) => {
  let session;

  try {
    const { postId } = req.params;
    const userId = req.userId;

    session = await mongoose.startSession();
    session.startTransaction();

    if (!postId) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Post not found",
      });
    }

    if (!userId) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "User not found",
      });
    }

    const post = await Post.findById(postId).session(session);
    if (!post) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const postAuthor = await User.findById(post.author).session(session);
    if (!postAuthor) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Post Author not found",
      });
    }

    const me = await User.findById(userId).session(session);
    if (!me) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isSelf = postAuthor._id.toString() === userId.toString();

    if (!isSelf) {
      const isBlocked =
        postAuthor.blockedUsers.some(
          (id) => id.toString() === userId.toString(),
        ) ||
        me.blockedUsers.some(
          (id) => id.toString() === postAuthor._id.toString(),
        );

      if (isBlocked) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "You are blocked by the user or you have blocked the user",
        });
      }

      const isPrivate = postAuthor.isPrivate;
      const isFollowed = postAuthor.followers.some(
        (id) => id.toString() === userId.toString(),
      );

      if (isPrivate && !isFollowed) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Private Account",
        });
      }
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      me.likedPosts = me.likedPosts.filter(
        (id) => id.toString() !== postId.toString(),
      );
    } else {
      post.likes.push(userId);
      me.likedPosts.push(postId);
    }
    await post.save({ session });
    await me.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      message: alreadyLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
      liked: !alreadyLiked,
      post,
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      message: `Internal Server Error: ${error.message}`,
    });
  } finally {
    session?.endSession();
  }
};

export {
    likePost,
    blockUser,
    unblockUser,
    comment,
    deleteComment
 };