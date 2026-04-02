import mongoose from "mongoose";

const CourseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLectureIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    certificateIssuedAt: {
      type: Date,
      default: null,
    },
    certificateId: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.CourseProgress ||
  mongoose.model("CourseProgress", CourseProgressSchema);
