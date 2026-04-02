import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: String,

    // ✅ profile fields
    username: { type: String, required: true },
    mobile: { type: String, default: "" },
    dob: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    country: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    pincode: { type: String, default: "" },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,
    tokenExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.models.User || model("User", UserSchema);