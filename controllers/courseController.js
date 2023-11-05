import Course from "../models/courseSchema.js";
import appError from "../utils/appError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

const getAllCourses = async (req, res, next) => {
  try {
    const allCourses = await Course.find({}).select("-lectures");
    if (!allCourses) {
      return next(new appError("No courses found", 400));
    }

    res.status(200).json({
      success: true,
      message: "Fetch all courses successfully",
      allCourses,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const getLectureByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const courses = await Course.findById(courseId);
    if (!courses) {
      return next(new appError("No course found", 400));
    }
    res.status(200).json({
      success: true,
      message: "Fetch all courses successfully",
      lectures: courses.lectures,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const createNewCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy, price,   validityAccess } = req.body;
    if (!title || !description || !category || !createdBy || !price || !validityAccess) {
      return next(new appError("All fields are mandotary", 400));
    }
    const newCourse = await Course.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        secure_url: "",
        public_id: "",
      },
      price,
      validityAccess
    });
    if (!newCourse) {
      return next(new appError("Course could not be created", 400));
    }
    if (req.file) {
      const uploadFile = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      if (uploadFile) {
        newCourse.thumbnail.secure_url = uploadFile.secure_url;
        newCourse.thumbnail.public_id = uploadFile.public_id;
        fs.rm(`uploads/${req.file.filename}`);
      } else {
        return next(new appError("File not uploaded, please try again", 400));
      }
    }
    await newCourse.save();
    res.status(200).json({
      success: true,
      message: "Course has been created successfully",
      newCourse,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        $set: req.body,
      },
      {
        runValidators: true,
      }
    );
    if (!course) {
      return next(new appError("Course with the given ID is not found.", 400));
    }
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new appError("Course with the given ID is not found.", 400));
    }
    await course.deleteOne();
    res.status(204).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const createLectureForCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new appError("Course with the given ID is not found.", 400));
    }
    if (!title || !description) {
      return next(new appError("All fields are mandotary", 400));
    }
    const lectureData = {
      title,
      description,
      lecture: {},
    };
    if (req.file) {
      const uploadFile = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      if (uploadFile) {
        lectureData.lecture.secure_url = uploadFile.secure_url;
        lectureData.lecture.public_id = uploadFile.public_id;
        fs.rm(`uploads/${req.file.filename}`);
      } else {
        return next(new appError("File not uploaded, please try again", 400));
      }
    }
    course.lectures.push(lectureData);
    course.numbersOfLectures = course.lectures.length;
    await course.save();
    res.status(204).json({
      success: true,
      message: "Lecture successfully added to the course",
      course,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const deleteLectureFromCourse = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new appError("Course with the given ID is not found.", 404));
    }
    course.lectures.id(lectureId).remove();
    await course.save();
    res.status(204).json({
      success: true,
      message: "Lecture successfully deleted from the course",
      course,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

export {
  getAllCourses,
  getLectureByCourseId,
  createNewCourse,
  createLectureForCourse,
  updateCourse,
  deleteCourse,
  deleteLectureFromCourse,
};
