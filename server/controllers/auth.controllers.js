import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";
import sendEmail from "../config/mail.js";
import OTP from "../models/otp.model.js";

const signUp = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const findByEmail = await User.findOne({ email });

    if (findByEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists !" });
    }
    const findByUserName = await User.findOne({ username });

    if (findByUserName) {
      return res
        .status(400)
        .json({ message: "User with this username already exists !" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long !" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = await genToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username !" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong Password !" });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};
const logOut = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "Logged out successfully !" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const sentOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist !" });
    }

    const otp = await sendEmail(email);

    if (!otp) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Please try again." });
    }
  await OTP.findOneAndUpdate(
  { email },
  {
    $set: {
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    },
  },
  {
    upsert: true,
   returnDocument: "after",
  }
);

    return res.status(200).json({ message: "OTP sent successfully !" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please request a new one." });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ email });
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    otpRecord.isVerified = true;
    await otpRecord.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }
    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required",
      });
    }
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || !otpRecord.isVerified) {
      return res.status(400).json({
        message: "OTP verification is required to reset password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist !" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await OTP.deleteOne({ email });

    return res.status(200).json({ message: "Password reset successfully !" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    const otp = await sendEmail(email);

    if (!otp) {
      return res.status(500).json({
        message: "Failed to send OTP. Please try again.",
      });
    }

    await OTP.findOneAndUpdate(
      { email },
      {
        $set: {
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          isVerified: false,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    return res.status(200).json({
      message: "OTP sent successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Internal Server Error: ${error.message}`,
    });
  }
};


export { signUp, signIn, logOut, sentOtp, verifyOtp, forgotPassword,sendSignupOtp };
