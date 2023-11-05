import { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [8, "Title must be at least 8 characters"],
      maxLength: [60, "Title should be less than 60 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minLength: [20, "Descriptin must be at least 20 characters"],
      maxLength: [1000, "Description should be less than 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    lectures: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        lecture: {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
        },
      },
    ],
    numbersOfLectures: {
      type: Number,
      default: 0,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    validityAccess: {
      type: Number, // Number of days (e.g., 730 for 2 years)
      required: [true, "Validity access is required"],
    }
  },
  {
    timestamps: true,
  }
);

const Course = model("course", courseSchema);

export default Course;
