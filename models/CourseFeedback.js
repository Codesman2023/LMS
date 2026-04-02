import mongoose from "mongoose";

const CourseFeedbackSchema = new mongoose.Schema(
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
    feedback: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

CourseFeedbackSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.CourseFeedback ||
  mongoose.model("CourseFeedback", CourseFeedbackSchema);
