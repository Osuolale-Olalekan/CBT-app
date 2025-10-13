// lib/actions/user.ts
import User, { IUser } from "../models/User";
// import { hash } from "bcrypt";
import dbConnect from "./dbConnect";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "student" | "admin";
  department?: "Science" | "Art" | "Commercial";
}

export interface UpdateUserData {
  name?: string;
  department?: "Science" | "Art" | "Commercial";
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  department?: "Science" | "Art" | "Commercial";
}


export async function createUser(
  userData: CreateUserData
): Promise<{ success: boolean; message: string; user?: PublicUser }> {
  try {
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return { success: false, message: "User already exists with this email" };
    }

    // Validate department for students
    if (userData.role === "student" && !userData.department) {
      return { success: false, message: "Department is required for students" };
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    return {
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: "Failed to create user",
    };
  }
}

export async function getUserById(userId: string): Promise<IUser | null> {
  try {
    await dbConnect();
    return await User.findById(userId).select("-password");
  } catch (error) {
    return null;
  }
}

export async function getUsersByDepartment(
  department: string
): Promise<IUser[]> {
  try {
    await dbConnect();
    return await User.find({ department, role: "student" })
      .select("-password")
      .sort({ name: 1 });
  } catch (error) {
    return [];
  }
}

export async function getAllUsers(): Promise<IUser[]> {
  try {
    await dbConnect();
    return await User.find({}).select("-password").sort({ createdAt: -1 });
  } catch (error) {
    return [];
  }
}

export async function updateUser(
  userId: string,
  updateData: UpdateUserData
): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, message: "User updated successfully" };
  } catch (error: unknown) {
    return {
      success: false,
      message: "Failed to update user",
    };
  }
}

export async function deleteUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, message: "User deleted successfully" };
  } catch (error: unknown) {
    return {
      success: false,
      message: "Failed to delete user",
    };
  }
}
