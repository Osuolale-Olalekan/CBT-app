import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Result from "@/models/Result";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest, context: { params: Promise<{ resultId: string }> }
) {
  try {
    await dbConnect();
    const {resultId} = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await Result.findById(resultId)
      .populate("userId", "name email")
      .populate("examId", "title department totalQuestions");

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Result not found" },
        { status: 404 }
      );
    }

    // Authorization: student can only view their own result, admin can view all
    if (user.role !== "admin" && result.userId._id.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Get Result Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
