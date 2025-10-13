// app/api/results/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Result from "@/models/Result";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Admins see ALL results
    let query = {};
    if (user.role !== "admin") {
      // Students only see their own results
      query = { userId: user.id };
    }

    const results = await Result.find(query)
      .populate("userId", "name email department")
      .populate("examId", "title department totalQuestions passingScore")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Get Global Results Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
