import React from "react";
import { Link } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import styles from "./ShowReel.module.css";

const ShowReel = ({ loops = [] }) => {
  if (loops.length === 0) {
    return (
      <div className={styles.emptyLoops}>
        <h2>No Loops Yet</h2>
        <p>No loops shared yet.</p>
      </div>
    );
  }

  // Filter out any invalid items and sort by creation date descending
  const sortedLoops = [...loops]
    .filter((l) => l && l._id)
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : 0;
      const dateB = b.createdAt ? new Date(b.createdAt) : 0;
      return dateB - dateA;
    });

  return (
    <div className={styles.loopsGrid}>
      {sortedLoops.map((loop) => (
        <Link
          key={loop._id}
          to={`/showOneLoop/${loop._id}`}
          className={styles.loopCard}
        >
          <img
            src={loop.thumbnail || "/reelIcon.png"}
            alt="Reel thumbnail"
            className={styles.loopThumbnail}
            onError={(e) => {
              e.target.src = "/reelIcon.png";
            }}
          />
          <div className={styles.loopOverlay}>
            <FaPlay />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ShowReel;
