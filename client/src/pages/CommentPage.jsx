import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaRegPaperPlane,
  FaBookmark,
  FaRegBookmark,
  FaTrash,
  FaArrowLeft,
  FaPaperPlane,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import styles from "./CommentPage.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function CommentPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const fetchCommentsData = async () => {
    try {
      setError(false);
      const res = await axios.get(`${API_URL}/api/post/getallcomments/${postId}`, {
        withCredentials: true,
      });
      setPost(res.data.post);
      setCurrentUser(res.data.currentUser);
      setComments(res.data.post.comments || []);
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  useEffect(() => {
    fetchCommentsData();
  }, [postId]);

  const isLiked = currentUser?.likedPosts?.some(
    (id) => id.toString() === post?._id.toString()
  );
  const isSaved = currentUser?.savedPosts?.some(
    (id) => id.toString() === post?._id.toString()
  );

  const handleLike = async () => {
    try {
      await axios.post(
        `${API_URL}/api/interaction/like/${post._id}`,
        {},
        { withCredentials: true }
      );
      
      setCurrentUser((prev) => {
        const liked = prev.likedPosts || [];
        return {
          ...prev,
          likedPosts: isLiked
            ? liked.filter((id) => id.toString() !== post._id.toString())
            : [...liked, post._id],
        };
      });

      setPost((prev) => {
        const likes = prev.likes;
        return {
          ...prev,
          likes: isLiked
            ? likes.filter((id) => id.toString() !== currentUser._id.toString())
            : [...likes, currentUser._id],
        };
      });
    } catch (err) {
      console.error("Like interaction failed:", err);
    }
  };

  const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeartPop(true);
    setTimeout(() => {
      setShowHeartPop(false);
    }, 1000);
  };

  const handleSave = async () => {
    try {
      await axios.post(
        `${API_URL}/api/post/save/${post._id}`,
        {},
        { withCredentials: true }
      );
      
      setCurrentUser((prev) => {
        const saved = prev.savedPosts || [];
        return {
          ...prev,
          savedPosts: isSaved
            ? saved.filter((id) => id.toString() !== post._id.toString())
            : [...saved, post._id],
        };
      });
    } catch (err) {
      console.error("Save interaction failed:", err);
    }
  };

  const handleShare = () => {
   
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/interaction/comment/${postId}`,
        { text: newComment.trim() },
        { withCredentials: true }
      );
      setNewComment("");
      if (res.data.commentId) {
        const localComment = {
          _id: res.data.commentId,
          text: newComment.trim(),
          createdAt: new Date().toISOString(),
          commentedBy: {
            _id: currentUser._id,
            username: currentUser.username,
            profilePicture: currentUser.profilePicture,
            stories: currentUser.stories || [],
          },
        };
        setComments((prev) => [localComment, ...prev]);
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    const commentId = commentToDelete;
    setCommentToDelete(null);
    try {
      await axios.post(
        `${API_URL}/api/interaction/delete-comment/${postId}/${commentId}`,
        {},
        { withCredentials: true }
      );
      setComments((prev) =>
        prev.filter((c) => c._id.toString() !== commentId.toString())
      );
    } catch (err) {
      console.error("Failed to delete comment:", err);
     
    }
  };

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <p>Failed to load comments or access denied.</p>
        <button onClick={fetchCommentsData} className={styles.retryBtn}>
          Try Again
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading comments...</p>
      </div>
    );
  }

  const isPostAuthorMe = post.author._id.toString() === currentUser._id.toString();
  const authorProfileLink = isPostAuthorMe
    ? "/myInfo"
    : `/lookFor/${post.author._id}`;

  const hasAuthorStory = post.author.stories && post.author.stories.length > 0;
  const authorStoryLink = hasAuthorStory
    ? `/lookForStory/${post.author.stories[0]._id || post.author.stories[0]}`
    : authorProfileLink;

  return (
    <div className={styles.page}>
      {/* TOP HEADER */}
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/favicon-v2.svg" alt="miniGram" />
          <h1>MiniGram</h1>
        </Link>
      </div>

      <div className={styles.container}>
        {/* SUBHEADER */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <h2>@{post.author.username}'s post comments</h2>
        </div>

        {/* SPLIT CONTAINER */}
        <div className={styles.splitWrapper}>
          
          {/* LEFT PANEL: POST MEDIA & DETAILS */}
          <div className={styles.leftPanel}>
            <div className={styles.postAuthorHeader}>
              <Link to={authorStoryLink} className={styles.authorLink}>
                <img
                  src={post.author.profilePicture || "/insta.webp"}
                  alt={post.author.username}
                  className={`${styles.authorAvatar} ${hasAuthorStory ? styles.avatarWithStory : ""}`}
                />
                <span className={styles.authorUsername}>
                  {post.author.username}
                </span>
              </Link>
            </div>

            <div className={styles.mediaContainer} onDoubleClick={handleDoubleClick}>
              {post.mediaType === "image" ? (
                <img
                  src={post.mediaUrl}
                  alt={post.caption || "Post Media"}
                  className={styles.media}
                />
              ) : (
                <video
                  src={post.mediaUrl}
                  className={styles.media}
                  controls
                  autoPlay
                  muted
                  loop
                />
              )}
              
              {showHeartPop && (
                <div className={styles.heartOverlay}>
                  <FaHeart size={70} className={styles.popHeartIcon} />
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <div className={styles.leftActions}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${isLiked ? styles.liked : ""}`}
                  onClick={handleLike}
                >
                  {isLiked ? <FaHeart /> : <FaRegHeart />}
                </button>
                <button type="button" className={styles.actionBtn} onClick={handleShare}>
                  <FaRegPaperPlane />
                </button>
              </div>
              <button
                type="button"
                className={`${styles.actionBtn} ${isSaved ? styles.saved : ""}`}
                onClick={handleSave}
              >
                {isSaved ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            </div>

            <div className={styles.captionContainer}>
              <Link to={`/seeWhoLiked/${post._id}`} className={styles.likesCountLink}>
                <div className={styles.likesCount}>
                  {post.likes.length.toLocaleString()} likes
                </div>
              </Link>
              <div className={styles.captionRow}>
                <Link to={authorProfileLink} className={styles.captionUser}>
                  {post.author.username}
                </Link>
                <span className={styles.captionText}>{post.caption}</span>
              </div>
              <div className={styles.postTime}>
                {post.createdAt
                  ? formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    }).toUpperCase()
                  : "JUST NOW"}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: COMMENTS & INPUT */}
          <div className={styles.rightPanel}>
            <div className={styles.commentsSection}>
              <h3 className={styles.commentsTitle}>Comments ({comments.length})</h3>
              <div className={styles.commentsList}>
                {comments.length === 0 ? (
                  <div className={styles.emptyComments}>
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => {
                    if (!comment.commentedBy) return null;
                    const isCommenterMe =
                      comment.commentedBy._id.toString() ===
                      currentUser._id.toString();
                    const commenterProfileLink = isCommenterMe
                      ? "/myInfo"
                      : `/lookFor/${comment.commentedBy._id}`;
                    
                    const hasCommenterStory = comment.commentedBy.stories && comment.commentedBy.stories.length > 0;
                    const commenterStoryLink = hasCommenterStory
                      ? `/lookForStory/${comment.commentedBy.stories[0]._id || comment.commentedBy.stories[0]}`
                      : commenterProfileLink;

                    const canDelete = isPostAuthorMe || isCommenterMe;

                    return (
                      <div key={comment._id} className={styles.commentRow}>
                        <div className={styles.commentContent}>
                          <Link to={commenterStoryLink} className={styles.commenterLink}>
                            <img
                              src={comment.commentedBy.profilePicture || "/insta.webp"}
                              alt={comment.commentedBy.username}
                              className={`${styles.commenterAvatar} ${hasCommenterStory ? styles.avatarWithStory : ""}`}
                            />
                          </Link>
                          <div className={styles.commentTextContainer}>
                            <div className={styles.commentUserHeader}>
                              <Link to={commenterProfileLink} className={styles.commenterUsername}>
                                {comment.commentedBy.username}
                              </Link>
                              <span className={styles.commentTime}>
                                {comment.createdAt
                                  ? formatDistanceToNow(new Date(comment.createdAt), {
                                      addSuffix: true,
                                    })
                                  : ""}
                              </span>
                            </div>
                            <p className={styles.commentText}>{comment.text}</p>
                          </div>
                        </div>

                        {canDelete && (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteComment(comment._id)}
                            title="Delete comment"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <form onSubmit={handlePostComment} className={styles.inputForm}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className={styles.commentInput}
                disabled={submitting}
              />
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!newComment.trim() || submitting}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>

        </div>
      </div>

      {commentToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Delete Comment</h3>
            <p>Are you sure you want to delete this comment?</p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                className={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteComment}
                className={styles.modalConfirmBtn}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentPage;
