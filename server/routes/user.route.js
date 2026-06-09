import express from "express";

import isAuth from "../middleware/isAuth.js";
import { getCurrentUser,suggestedUsers,editProfile,getProfile } from "../controllers/user.controller.js";
import {
  upload
} from "../config/cloudinary.js";
const userRouter = express.Router();
userRouter.get("/current",isAuth, getCurrentUser);
userRouter.get("/suggested", isAuth, suggestedUsers);
userRouter.post("/editProfile", isAuth,upload.single("profilepic"), editProfile);
userRouter.get("/getProfile/:username", isAuth,getProfile);
export default userRouter;


