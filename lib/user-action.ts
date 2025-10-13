"use server"

import dbConnect from "./dbConnect"
import User from "../models/User"
import bcrypt from "bcrypt"
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

interface RegisterUserData {
  name: string
  email: string
  password: string
  department: string
  role?: "student" | "admin"
}

const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET!);
export async function registerUser(data: RegisterUserData) {
  try {
    await dbConnect()

    const existingUser = await User.findOne({ email: data.email.toLowerCase().trim() })
    if (existingUser) {
      return { success: false, message: "Email already exists" }
    }

    // const hashedPassword = await bcrypt.hash(data.password, 10)

    const newUser = new User({
      name: data.name,
      email: data.email,
      password: data.password,
      department: data.department,
      role: data.role || "student",
    })

    await newUser.save()

    return { success: true, message: "Registration successful" }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Something went wrong" }
  }
}


export const loginAction = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const token = await new SignJWT({ id: String(user._id), role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h")
      .setIssuedAt()
      .sign(encodedSecret);

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 2 * 60 * 60, // 2 hours
    });

    return { success: true, role: user.role };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const logout = async () => {
	const cookieStore = await cookies();

	cookieStore.delete("token");
}


export const verifyUser = async () => {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		return { success: false }
	}

	// const payload = jwt.verify(token, process.env.JWT_SECRET!);
	const { payload } = await jwtVerify(token, encodedSecret, {
		algorithms: ['HS256']
	})

	return {
		id: payload.id,
		success: true
	}
}

export const getUserWithId = async (id: string) => {
	const user = await User.findById(id).lean();

	return user;
}