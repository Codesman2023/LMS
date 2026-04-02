import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            default: 0,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",     // reference to User collection
            required: true,
        },
        published: {
            type: Boolean,
            default: false,
        },
        lecturesCount:{
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);