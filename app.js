import express from "express";
import cors from "cors";
import morgan from "morgan";
import UserRouter from "./routes/userRoutes.js";
import CourseRouter from "./routes/courseRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/course", CourseRouter);
app.all("*", (req, res) => {
  res.status(404).send("OOPS!! Page not found");
});
app.use(errorMiddleware);
export default app;
