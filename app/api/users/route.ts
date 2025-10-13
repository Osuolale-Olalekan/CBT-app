import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

// ✅ GET all users (Admin only)
export async function GET() {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Get Users Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

// ✅ (Optional) Create new user — you might already have register route
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, department } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    // prevent duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 });
    }

    const newUser = await User.create({ name, email, password, role, department });
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Create User Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
