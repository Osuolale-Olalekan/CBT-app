// lib/models/User.ts
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document<string> {
  _id: string; // 👈 Explicitly typed as string
  name: string;
  email: string;
  password: string;
  role: "student" | "admin";
  // department?: "Science" | "Art" | "Commercial"; //might revert to this if class mode didn't work
    department?: "JSS 1" | "JSS 2" | "JSS 3";
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      required: true,
    },
    department: {
      type: String,
      enum: ["JSS 1", "JSS 2", "JSS 3"], //might revert to department mode but let's use class mode for now
      required: function (this: IUser) {
        return this.role === "student";
      },
    },
  },
  {
    timestamps: true,
  }
);

// 🔑 Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
