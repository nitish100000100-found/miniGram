import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import {
  FaUser,
  FaBriefcase,
  FaVenusMars,
  FaInfoCircle,
  FaLock,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaEllipsisH,
  FaRegComment,
  FaRegPaperPlane,
} from "react-icons/fa";
import { MdOutlinePersonOff } from "react-icons/md";

import styles from "./LookFor.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function LookFor() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setnotFound] = useState(false);
  const [heartPopPostId, setHeartPopPostId] = useState(null);

  const handleDoubleClick = (postId, isLiked) => {
    if (!isLiked) {
      handleLike(postId, isLiked);
    }
    setHeartPopPostId(postId);
    setTimeout(() => {
      setHeartPopPostId(null);
    }, 800);
  };

  //current user is me
  // user is the one i'm looking for

  const handleLike = async (postId, isLiked) => {
    if (!currentUser) return;
    try {
      await axios.post(
        `${API_URL}/api/interaction/like/${postId}`,
        {},
        { withCredentials: true }
      );
      
      setCurrentUser((prev) => {
        const liked = prev.likedPosts || [];
        return {
          ...prev,
          likedPosts: isLiked
            ? liked.filter((id) => id.toString() !== postId.toString())
            : [...liked, postId],
        };
      });

      setUser((prev) => {
        if (!prev) return prev;
        const updatedPosts = (prev.posts || []).map((p) => {
          if (p._id.toString() === postId.toString()) {
            const likes = p.likes || [];
            return {
              ...p,
              likes: isLiked
                ? likes.filter((id) => id.toString() !== currentUser._id.toString())
                : [...likes, currentUser._id],
            };
          }
          return p;
        });
        return { ...prev, posts: updatedPosts };
      });
    } catch (err) {
      console.error("Like interaction failed:", err);
    }
  };

  const handleComment = (post) => console.log("Comment:", post);
  const handleShare = (post) => console.log("Share:", post);

  const handleSave = async (postId, isSaved) => {
    if (!currentUser) return;
    try {
      await axios.post(
        `${API_URL}/api/post/save/${postId}`,
        {},
        { withCredentials: true }
      );
      
      setCurrentUser((prev) => {
        const saved = prev.savedPosts || [];
        return {
          ...prev,
          savedPosts: isSaved
            ? saved.filter((id) => id.toString() !== postId.toString())
            : [...saved, postId],
        };
      });
    } catch (err) {
      console.error("Save interaction failed:", err);
    }
  };
  const [showCommonUsers, setShowCommonUsers] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const profileRes = await axios.get(
          `${API_URL}/api/user/lookFor/${id}`,
          {
            withCredentials: true,
          },
        );

        const currentRes = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
        });

        setUser(profileRes.data);
        setCurrentUser(currentRes.data.user);
      } catch (error) {
        console.error(error);

        if (error.response?.data?.message === "User not found") {
          setnotFound(true);
        }
        if (
          error.response?.data?.message === "Unauthorized: No token provided !"
        ) {
          navigate("/signin");
        }
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [id]);

  const isFollowing = user?.isFollowing;

  const requestSent = user?.isRequested;
  const canViewProfile =
    !user?.isPrivate ||
    isFollowing ||
    currentUser?._id?.toString() === user?._id?.toString();

  const sendRequest = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/interaction/followsomeone/${user._id}`,
        {
          fromUserId: currentUser._id,
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.followed) {
        setCurrentUser((prev) => ({
          ...prev,
          following: [...(prev.following || []), user._id],
        }));
        setUser((prev) => ({
          ...prev,
          isFollowing: true,
          followers: [...(prev.followers || []), currentUser._id],
          followersLength: (prev.followersLength ?? prev.followers?.length ?? 0) + 1,
        }));
      } else {
        setCurrentUser((prev) => ({
          ...prev,
          sendRequest: [...(prev.sendRequest || []), user._id],
        }));
        setUser((prev) => ({
          ...prev,
          isRequested: true,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unfollow = async () => {
    try {
      await axios.post(
        `${API_URL}/api/interaction/unfollowsomeone/${user._id}`,
        {
          fromUserId: currentUser._id,
        },
        {
          withCredentials: true,
        },
      );

      setCurrentUser((prev) => ({
        ...prev,
        following: (prev.following || []).filter(
          (followingId) => followingId !== user._id,
        ),
      }));
      setUser((prev) => ({
        ...prev,
        isFollowing: false,
        followers: (prev.followers || []).filter(
          (followerId) => followerId !== currentUser._id,
        ),
        followersLength: Math.max(0, (prev.followersLength ?? prev.followers?.length ?? 0) - 1),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const cancelRequest = async () => {
    try {
      await axios.post(
        `${API_URL}/api/interaction/cancelsendrequest/${user._id}`,
        {
          fromUserId: currentUser._id,
        },
        {
          withCredentials: true,
        },
      );

      setCurrentUser((prev) => ({
        ...prev,
        sendRequest: (prev.sendRequest || []).filter(
          (requestId) => requestId !== user._id,
        ),
      }));
      setUser((prev) => ({
        ...prev,
        isRequested: false,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (notFound || !user) {
    return (
      <div className={styles.notFound}>
        <MdOutlinePersonOff />
        <h3>User Not Found or Some Server Error</h3>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/favicon-v2.svg" alt="miniGram" />
          <h1>MiniGram</h1>
        </Link>

        <Link to="/" className={styles.backBtn}>
          ← Back
        </Link>
      </div>

      {/* PROFILE */}
      <div className={styles.profileCard}>
        <div className={styles.left}>
          {user.stories && user.stories.length > 0 ? (
            <Link to={`/lookForStory/${user.stories[0]._id || user.stories[0]}`}>
              <img
                src={user.profilePicture || "/insta.webp"}
                alt={user.name}
                className={`${styles.avatar} ${styles.avatarWithStory}`}
              />
            </Link>
          ) : (
            <img
              src={user.profilePicture || "/insta.webp"}
              alt={user.name}
              className={styles.avatar}
            />
          )}
        </div>

        <div className={styles.right}>
          <h2>@{user.username || "unknown_user"}</h2>

          <div className={styles.stats}>
            <div>
              <strong>{user.postsLength ?? user.posts?.length ?? 0}</strong>
              <span>Posts</span>
            </div>

            <div>
              {canViewProfile ? (
                <Link to={`/lookfollowers/${user._id}`}>
                  <strong>
                    {user.followersLength ?? user.followers?.length ?? 0}
                  </strong>
                  <span>Followers</span>
                </Link>
              ) : (
                <>
                  <strong>
                    {user.followersLength ?? user.followers?.length ?? 0}
                  </strong>
                  <span>Followers</span>
                </>
              )}
            </div>

            <div>
              {canViewProfile ? (
                <Link to={`/lookfollowing/${user._id}`}>
                  <strong>
                    {user.followingLength ?? user.following?.length ?? 0}
                  </strong>
                  <span>Following</span>
                </Link>
              ) : (
                <>
                  <strong>
                    {user.followingLength ?? user.following?.length ?? 0}
                  </strong>
                  <span>Following</span>
                </>
              )}
            </div>
          </div>

          {/* FOLLOW BUTTONS */}
          <div className={styles.actions}>
            {isFollowing ? (
              <button className={styles.followingBtn} onClick={unfollow}>Unfollow</button>
            ) : requestSent ? (
              <button className={styles.cancelBtn} onClick={cancelRequest}>
                Cancel Request
              </button>
            ) : (
              <button className={styles.followBtn} onClick={sendRequest}>
                Follow
              </button>
            )}

            {canViewProfile && (
              <button className={styles.messageBtn}>Message</button>
            )}
          </div>
          {user.commonUsers?.length > 0 && (
            <div className={styles.commonUsers}>
              <p>
                Followed by{" "}
                {user.commonUsers.slice(0, 3).map((u, idx) => (
                  <span key={u._id}>
                    <Link
                      to={`/lookFor/${u._id}`}
                      className={styles.inlineUserLink}
                    >
                      <strong>{u.username}</strong>
                    </Link>

                    {idx < Math.min(3, user.commonUsers.length) - 1 ? ", " : ""}
                  </span>
                ))}
                {user.commonUsers.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowCommonUsers((prev) => !prev)}
                  >
                    {showCommonUsers
                      ? " show less"
                      : ` and ${user.commonUsers.length - 3} others`}
                  </button>
                )}
              </p>

              {showCommonUsers && user.commonUsers.length > 3 && (
                <div className={styles.commonUsersList}>
                  {user.commonUsers.slice(3).map((u) => (
                    <Link
                      key={u._id}
                      to={`/lookFor/${u._id}`}
                      className={styles.commonUserLink}
                    >
                      <img
                        src={u.profilePicture || "/insta.webp"}
                        alt={u.username}
                        className={styles.smallAvatar}
                      />

                      <div className={styles.commonUserInfo}>
                        <div className={styles.commonUserName}>{u.name}</div>

                        <div className={styles.commonUserUsername}>
                          @{u.username}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <FaUser />
              <span>{user.name || "Unknown User"}</span>
            </div>

            <div className={styles.infoCard}>
              <FaBriefcase />
              <span>{user.profession || "Profession not shared"}</span>
            </div>

            <div className={styles.infoCard}>
              <FaVenusMars />
              <span>{user.gender || "Gender not shared"}</span>
            </div>

            <div className={styles.infoCard}>
              <FaInfoCircle />
              <span>{user.bio || "No bio shared yet"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      {canViewProfile && user.highlights && user.highlights.length > 0 && (
        <div className={styles.highlightsSection}>
          <div className={styles.highlightsList}>
            {user.highlights.map((highlight) => (
              <div key={highlight._id} className={styles.highlightItem}>
                <div className={styles.highlightRing}>
                  <img
                    src={highlight.coverImage || "/insta.webp"}
                    alt={highlight.title}
                    className={styles.highlightImage}
                  />
                </div>
                <span className={styles.highlightTitle}>{highlight.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POSTS */}
      <div className={styles.postsSection}>
        <h3>Posts</h3>

        {canViewProfile ? (
          user.posts?.length === 0 ? (
            <div className={styles.emptyPosts}>
              <h2>No Posts Yet</h2>
              <p>This user hasn't shared anything yet.</p>
            </div>
          ) : (
            <div className={styles.postsGrid}>
              {[...(user.posts || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((post) => {
                const isLiked = currentUser?.likedPosts?.some(
                  (id) => id.toString() === post._id.toString(),
                );

                const isSaved = currentUser?.savedPosts?.some(
                  (id) => id.toString() === post._id.toString(),
                );

                return (
                  <div key={post._id} className={styles.feedPostCard}>
                    {/* Post Header */}
                    <div className={styles.postHeader}>
                      <div className={styles.postAuthorInfo}>
                        <img
                          src={user.profilePicture || "/insta.webp"}
                          alt="Author Avatar"
                          className={`${styles.postAuthorAvatar} ${user.stories && user.stories.length > 0 ? styles.postAuthorAvatarWithStory : ""}`}
                        />
                        <div className={styles.postMeta}>
                          <span className={styles.postUsername}>{user.username}</span>
                          {post.location && (
                            <span className={styles.postLocation}>{post.location}</span>
                          )}
                        </div>
                      </div>
                      <button className={styles.postMoreBtn}>
                        <FaEllipsisH />
                      </button>
                    </div>

                    {/* Post Media */}
                    <div
                      className={styles.postMediaContainer}
                      onDoubleClick={() => handleDoubleClick(post._id, isLiked)}
                    >
                      {post.mediaType === "image" ? (
                        <img
                          src={post.mediaUrl}
                          alt={post.caption || "Post"}
                          className={styles.postImage}
                        />
                      ) : (
                        <video
                          src={post.mediaUrl}
                          className={styles.postImage}
                          muted
                          controls
                        />
                      )}
                      {heartPopPostId === post._id && (
                        <div className={styles.heartOverlay}>
                          <FaHeart size={70} className={styles.popHeartIcon} />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.postActions}>
                      <div className={styles.postLeftActions}>
                        <button 
                          className={`${styles.postActionBtn} ${isLiked ? styles.postLiked : ""}`}
                          onClick={() => handleLike(post._id, isLiked)}
                        >
                          {isLiked ? <FaHeart /> : <FaRegHeart />}
                        </button>
                        <Link to={`/commentpage/${post._id}`} className={styles.postActionBtn}>
                          <FaRegComment />
                          <span className={styles.commentCount}>{post.comments?.length || 0}</span>
                        </Link>
                        <button 
                          className={styles.postActionBtn}
                          onClick={() => handleShare(post)}
                        >
                          <FaRegPaperPlane />
                        </button>
                      </div>

                      <button 
                        className={`${styles.postActionBtn} ${isSaved ? styles.postSaved : ""}`}
                        onClick={() => handleSave(post._id, isSaved)}
                      >
                        {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className={styles.postContent}>
                      <Link to={`/seeWhoLiked/${post._id}`} className={styles.likesCountLink}>
                        <div className={styles.postLikesCount}>
                          {(post.likes?.length || 0).toLocaleString()} likes
                        </div>
                      </Link>
                      <div className={styles.postCaption}>
                        <span className={styles.postCaptionUser}>{user.username}</span>
                        <span className={styles.postCaptionText}>{post.caption}</span>
                      </div>
                      <div className={styles.postTime}>
                        {post.createdAt 
                          ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).toUpperCase()
                          : "JUST NOW"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className={styles.privateAccount}>
            <FaLock />
            <h2>Private Account</h2>
            <p>Follow this account to see photos and videos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LookFor;
