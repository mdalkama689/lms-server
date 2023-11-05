import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  forgotUserPassword,
  resetUserPassword,
  changeUserPassword,
  updateUserProfile,
} from "../controllers/userContoller.js";
import { isLoggedIn } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me/:userId", isLoggedIn, getUserProfile);
router.post("/forgot-password", forgotUserPassword);
router.post("/reset-password/:resetToken", resetUserPassword);
router.post("/change-password", isLoggedIn, changeUserPassword);
router.put(
  "/update/:userId",
  isLoggedIn,
  upload.single("avatar"),
  updateUserProfile
);
export default router;
