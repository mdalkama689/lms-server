import appError from "../utils/appError.js";
import User from "../models/userSchema.js";
import passwordHashing from "../utils/passwordHassing.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import { config } from "dotenv";
import sendEmail from "../utils/sendEmail.js";
config();

const saltRounds = 10;

const options = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
};

const secretKey = process.env.SECRET_KEY;

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new appError("All fields are required", 400));
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new appError("Email already registered", 400));
    }
    const hashedPassword = await passwordHashing(password, saltRounds);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: {
        public_id: "",
        secure_url: "",
      },
    });
    if (req.file) {
      const uploadFile = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });
      if (uploadFile) {
        user.avatar.secure_url = uploadFile.secure_url;
        user.avatar.public_id = uploadFile.public_id;
        fs.rm(`uploads/${req.file.filename}`);
      } else {
        return next(new appError("File not uploaded, please try again", 400));
      }
    }

    if (!user) {
      return next(
        new appError("User registration failed, please try again", 400)
      );
    }
    await user.save();
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subsciption: user.subscription,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });
    res.cookie("token", token, options);
    user.password = undefined;
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new appError("All fields are required", 400));
    }
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return next(
        new appError("Email does not exists, please create a new account", 400)
      );
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return next(new appError("Email or password does not match", 400));
    }
    const payload = {
      id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      subscription: existingUser.subscription,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });
    res.cookie("token", token, options);
    existingUser.password = undefined;
    res.status(200).json({
      success: true,
      message: "User loggedin successfully",
      existingUser,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", null, null);
    res.status(200).json({
      success: true,
      message: "User logout successfully",
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(
        new appError("Email does not exists, please create a new account", 400)
      );
    }
    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const forgotUserPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new appError("Email is required", 400));
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(new appError("Email not registerd", 400));
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    existingUser.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    existingUser.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

    await existingUser.save();
    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(email, resetPasswordURL);
    res.status(200).json({
      success: true,
      message: `Reset password token has been sent ${email} successfully `,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const resetUserPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;
    const forgotPasswordToken = crypto
      .create("sha256")
      .update(resetToken)
      .digest("hex");
    const existingUser = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!existingUser) {
      return next(new appError("Invalid or expired token", 400));
    }
    const hashedPassword = await passwordHashing(password, saltRounds);
    existingUser.password = hashedPassword;
    existingUser.forgotPasswordExpiry = undefined;
    existingUser.forgotPasswordToken = undefined;
    await existingUser.save();
    res.status(200).json({
      success: true,
      message: "Your password changed successfully",
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const changeUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword || !newPassword) {
      return next(new appError("All fields are required", 400));
    }
    const existingUser = await User.findById({ id });
    if (!existingUser) {
      return next(
        new appError("User does not exists, please create a new account", 400)
      );
    }
    const isPasswordCorrect = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return next(new appError("Email or password does not match", 400));
    }
    const hashedPassword = await passwordHashing(newPassword, saltRounds);
    existingUser.password = hashedPassword;
    await existingUser.save();
    existingUser.password = undefined;
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      existingUser,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const existingUser = await User.findById({ userId });
    if (!existingUser) {
      return next(
        new appError("User does not exists, please create a new account", 400)
      );
    }
    if (req.body.name) {
      existingUser.name = req.body.name;
    }
    if (req.body.password) {
      const hashedPassword = await passwordHashing(
        req.body.password,
        saltRounds
      );
      existingUser.password = hashedPassword;
    }
    if (req.file) {
      await cloudinary.v2.uploader.destroy(existingUser.avatar.public_id);
      if (req.file) {
        const uploadFile = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });
        if (uploadFile) {
          existingUser.avatar.secure_url = uploadFile.secure_url;
          existingUser.avatar.public_id = uploadFile.public_id;
          fs.rm(`uploads/${req.file.filename}`);
        } else {
          return next(new appError("File not uploaded, please try again", 400));
        }
      }
    }
    await existingUser.save();
    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      existingUser,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  forgotUserPassword,
  resetUserPassword,
  changeUserPassword,
  updateUserProfile,
};
