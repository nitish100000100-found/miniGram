import jwt from "jsonwebtoken";

const genToken = async (userID) => {
  try {
    const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, {
      expiresIn: "10y",
    });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    return res.status(500).json({
      message: `Internal server error while generating token: ${error.message}`,
    });
  }
};

export default genToken;
