// app/api/exams/[examId]/session/route.ts
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import ExamSession from "@/models/ExamSession";
// import { getCurrentUser } from "@/lib/auth";

// export async function GET(req: Request, { params }: { params: { examId: string } }) {
//   await dbConnect();
//   const user = await getCurrentUser();
//   if (!user) return NextResponse.json({ success: false }, { status: 401 });

//   const session = await ExamSession.findOne({ student: user.id, exam: params.examId });
//   if (!session) return NextResponse.json({ success: false });

//   return NextResponse.json({ success: true, session });
// }





import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Exam from "@/models/Exam";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { examId: string } }) {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Find exam and populate all questions
    const exam = await Exam.findById(params.examId)
      .populate({
        path: "questions",
        select: "text options subject department",
      })
      .lean();

    if (!exam) {
      return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error("Fetch Exam Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}





// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Exam from "@/models/Exam";

// export async function GET(
//   req: Request,
//   { params }: { params: { examId: string } }
// ) {
//   console.log("Exam ID:", params.examId)
//   try {
//     await dbConnect();

//     const exam = await Exam.findById(params.examId)
//       .populate("questions", "text options subject department");

//     if (!exam) {
//       return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, exam });
//   } catch (error) {
//     console.error("Exam Fetch Error:", error);
//     return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
//   }
// }
