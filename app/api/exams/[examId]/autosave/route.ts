// app/api/exams/[examId]/autosave/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ExamSession from "@/models/ExamSession";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { examId: string } }) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { answers, startTime } = await req.json();

    let session = await ExamSession.findOne({ student: user.id, exam: params.examId });

    // If session exists and is already submitted, block autosave
    if (session && session.isSubmitted) {
      return NextResponse.json({
        success: false,
        message: "Exam already submitted. Autosave disabled.",
      }, { status: 400 });
    }

    if (!session) {
      // First time autosave → create session
      session = new ExamSession({
        student: user.id,
        exam: params.examId,
        startTime: new Date(startTime),
        answers: [],
        isSubmitted: false,
      });
    }

    session.answers = answers;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Autosave Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
