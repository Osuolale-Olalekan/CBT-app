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

    const results = await Result.find({ userId: user.id })
      .populate("examId", "title department totalQuestions")
      .populate({
        path: "sessionId",
        select: "submittedAt startTime endTime",
        options: { strictPopulate: false }, // avoid StrictPopulateError
      });

    return NextResponse.json({
      success: true,
      results: results.map((r) => ({
        _id: r._id,
        examId: r.examId, // populated exam
        score: r.score,
        percentage: r.percentage,
        submittedAt: r.sessionId ? r.sessionId.submittedAt : r.submittedAt,
        startTime: r.sessionId ? r.sessionId.startTime : null,
        endTime: r.sessionId ? r.sessionId.endTime : null,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get User Results Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
