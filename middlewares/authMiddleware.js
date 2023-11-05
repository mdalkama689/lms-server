import appError from "../utils/appError.js";
import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return next(
        new appError("Unauthenticated, please login to continue", 400)
      );
    }

    const userDetails = await jwt.verify(token, process.env.SECRET_KEY);
    req.user = userDetails;
    next();
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role === "ADMIN") {
      return next(); // Allow access for admin users
    }
    return next(new appError("You cannot access this, only for admins", 403));
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};

export { isLoggedIn, isAdmin };
