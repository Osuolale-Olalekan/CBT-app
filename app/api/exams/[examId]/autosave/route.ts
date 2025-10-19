//WORKING BUT CHANGED IT TO THE ONE BELOW DUE TO ERROR ENCOUNTERED DURING DEPLOYMENT
// app/api/exams/[examId]/autosave/route.ts
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import ExamSession from "@/models/ExamSession";
// import { getCurrentUser } from "@/lib/auth";

// export async function POST(req: Request, { params }: { params: { examId: string } }) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//     }

//     const { answers, startTime } = await req.json();

//     let session = await ExamSession.findOne({ student: user.id, exam: params.examId });

//     // If session exists and is already submitted, block autosave
//     if (session && session.isSubmitted) {
//       return NextResponse.json({
//         success: false,
//         message: "Exam already submitted. Autosave disabled.",
//       }, { status: 400 });
//     }

//     if (!session) {
//       // First time autosave → create session
//       session = new ExamSession({
//         student: user.id,
//         exam: params.examId,
//         startTime: new Date(startTime),
//         answers: [],
//         isSubmitted: false,
//       });
//     }

//     session.answers = answers;
//     await session.save();

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Autosave Error:", error);
//     return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
//   }
// }





// app/api/exams/[examId]/autosave/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ExamSession from "@/models/ExamSession";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, context: { params: Promise<{ examId: string }> }) {
  try {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await context.params; // ✅ await the promise
    const { answers, startTime } = await req.json();

    let session = await ExamSession.findOne({ student: user.id, exam: examId });

    // ✅ Block autosave if exam already submitted
    if (session && session.isSubmitted) {
      return NextResponse.json(
        { success: false, message: "Exam already submitted. Autosave disabled." },
        { status: 400 }
      );
    }

    // ✅ Create session if it doesn't exist
    if (!session) {
      session = new ExamSession({
        student: user.id,
        exam: examId,
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
