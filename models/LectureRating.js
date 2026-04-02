import mongoose from "mongoose";

const LectureRatingSchema = new mongoose.Schema(
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
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true },
);

LectureRatingSchema.index({ userId: 1, lectureId: 1 }, { unique: true });
LectureRatingSchema.index({ lectureId: 1, rating: 1 });

export default mongoose.models.LectureRating ||
  mongoose.model("LectureRating", LectureRatingSchema);
