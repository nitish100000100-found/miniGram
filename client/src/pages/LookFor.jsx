import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaUser,
  FaBriefcase,
  FaVenusMars,
  FaInfoCircle,
  FaLock,
} from "react-icons/fa";
import styles from "./LookFor.module.css";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

function LookFor() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setnotFound] = useState(false);

  //current user is me
  // user is the one i'm looking for

  const handleLike = (id) => console.log("Like:", id);
  const handleComment = (post) => console.log("Comment:", post);
  const handleShare = (post) => console.log("Share:", post);
  const handleSave = (id) => console.log("Save:", id);

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
        setCurrentUser(currentRes.data);
      } catch (error) {
        console.error(error);
        console.log("yaha pe")
          setnotFound(true);
        
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [id]);

const isFollowing = currentUser?.following?.some(
  (id) => id.toString() === user?._id?.toString(),
);

const requestSent = currentUser?.sendRequest?.some(
  (id) => id.toString() === user?._id?.toString(),
);
  const canViewProfile =
    !user?.isPrivate ||
    isFollowing ||
    currentUser?._id?.toString() === user?._id?.toString();

  const sendRequest = async () => {
    try {
      await axios.post(
        `${API_URL}/api/user/send-request/${user._id}`,
        {
          fromUserId: currentUser._id,
        },
        {
          withCredentials: true,
        },
      );

      setCurrentUser((prev) => ({
        ...prev,
        sendRequest: [...(prev.sendRequest || []), user._id],
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const cancelRequest = async () => {
    try {
      await axios.post(
        `${API_URL}/api/user/cancel-request/${user._id}`,
        {
          fromUserId: currentUser._id,
        },
        {
          withCredentials: true,
        },
      );

      setCurrentUser((prev) => ({
        ...prev,
        sendRequest: prev.sendRequest.filter(
          (requestId) => requestId !== user._id,
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  };

if (loading) {
  return <div className={styles.loading}>Loading...</div>;
}

if (notFound || !user) {
  return <div className={styles.notFound}>User Not Found</div>;
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
          <img
            src={user.profilePicture || "/insta.webp"}
            alt={user.name}
            className={styles.avatar}
          />
        </div>

        <div className={styles.right}>
          <h2>@{user.username || "unknown_user"}</h2>

          <div className={styles.stats}>
            <div>
              <strong>{user.posts?.length || 0}</strong>
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
              <button className={styles.followingBtn}>Following</button>
            ) : requestSent ? (
              <button className={styles.cancelBtn} onClick={cancelRequest}>
                Cancel Request
              </button>
            ) : (
              <button className={styles.followBtn} onClick={sendRequest}>
                Follow
              </button>
            )}
          </div>

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
              {user.posts.map((post) => {
                const isLiked = currentUser?.likedPosts?.some(
                  (id) => id.toString() === post._id.toString(),
                );

                const isSaved = currentUser?.savedPosts?.some(
                  (id) => id.toString() === post._id.toString(),
                );

                return (
                  <div key={post._id} className={styles.postCard}>
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
                      />
                    )}

                    <div className={styles.overlay}>
                      <button onClick={() => handleLike(post._id)}>
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                        <span>{post.likes?.length || 0}</span>
                      </button>

                      <button onClick={() => handleComment(post)}>
                        <FaComment />
                        <span>{post.comments?.length || 0}</span>
                      </button>

                      <button onClick={() => handleShare(post)}>
                        <FaShare />
                      </button>

                      <button onClick={() => handleSave(post._id)}>
                        {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                      </button>
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
