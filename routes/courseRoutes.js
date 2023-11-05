import { Router } from "express";
import {
  getAllCourses,
  getLectureByCourseId,
  createNewCourse,
  createLectureForCourse,
  updateCourse,
  deleteCourse,
  deleteLectureFromCourse,
} from "../controllers/courseController.js";
import { isLoggedIn, isAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";
const router = Router();

router.get("/", getAllCourses);
router.get("/:courseId", isLoggedIn, getLectureByCourseId);
router.post(
  "/",
  isLoggedIn,
  isAdmin,
  upload.single("thumbnail"),
  createNewCourse
);
router.post(
  "/:courseId",
  isLoggedIn,
  isAdmin,
  upload.single("lecture"),
  createLectureForCourse
);
router.put("/:courseId", isLoggedIn, isAdmin, updateCourse);
router.delete("/:courseId", isLoggedIn, isAdmin, deleteCourse);
router.delete(
  "/course/:courseId/lecture/:lectureId",
  isLoggedIn,
  isAdmin,
  deleteLectureFromCourse
);
export default router;
