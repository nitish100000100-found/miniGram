import express from "express";
import { upload } from "../config/cloudinary.js";
import isAuth from "../middleware/isAuth.js";
import { validateLoopUpload, isLoopAuthor } from "../middleware/loop.middleware.js";
import {
  uploadLoop,
  deleteLoop,
  updateLoop,
  likeLoop,
  commentLoop,
  deleteCommentLoop,
  getLoops,
  getLoopById,
} from "../controllers/loop.controllers.js";

const loopRouter = express.Router();


loopRouter.post("/upload", isAuth, upload.single("video"), validateLoopUpload, uploadLoop);

loopRouter.get("/", isAuth, getLoops);


loopRouter.get("/:loopId/get", getLoopById);

loopRouter.post("/:loopId/update", isAuth, isLoopAuthor, updateLoop);

loopRouter.post("/:loopId/delete", isAuth, isLoopAuthor, deleteLoop);

loopRouter.post("/:loopId/like", isAuth, likeLoop);

loopRouter.post("/:loopId/comment", isAuth, commentLoop);

loopRouter.post("/:loopId/comment/:commentId", isAuth, deleteCommentLoop);



export default loopRouter;
