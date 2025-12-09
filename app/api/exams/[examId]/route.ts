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




//WORKING CODE BUT FAILS WHILE DEPLOYING 19/20/2025
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Exam from "@/models/Exam";
// import { getCurrentUser } from "@/lib/auth";

// export async function GET(req: Request, { params }: { params: { examId: string } }) {
//   try {
//     await dbConnect();

//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//     }

//     // Find exam and populate all questions
//     const exam = await Exam.findById(params.examId)
//       .populate({
//         path: "questions",
//         select: "text options subject department",
//       })
//       .lean();

//     if (!exam) {
//       return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, exam });
//   } catch (error) {
//     console.error("Fetch Exam Error:", error);
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }




//SO I CHANGED IT TO THIS TO CHECK IF IT WILL WORK AND THIS WORKS BUT I HAVE TO RANDOMIZE MY QUESTIONS AND ANSWER TO THE ONE BELOW IT
// import { NextResponse, NextRequest } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Exam from "@/models/Exam";
// import Question from "@/models/Question";
// import { getCurrentUser } from "@/lib/auth";

// export async function GET(req: NextRequest, context: { params: Promise<{ examId: string }> }) {
//   try {
//     await dbConnect();

//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//     }

//     // ✅ Await the params Promise
//     const { examId } = await context.params;

//     // Find exam and populate all questions
//     const exam = await Exam.findById(examId)
//       .populate({
//         path: "questions",
//         select: "text options subject department",
//       })
//       .lean();

//     if (!exam) {
//       return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, exam });
//   } catch (error) {
//     console.error("Fetch Exam Error:", error);
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }



//RANDOMIZING QUESTIONS
// import { NextResponse, NextRequest } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Exam from "@/models/Exam";
// import { getCurrentUser } from "@/lib/auth";
// import { IExamPopulated, IQuestionPopulated } from "@/types/exam-types";

// // ----------------------------------
// // GENERIC SHUFFLE FUNCTION (TYPED)
// // ----------------------------------
// function shuffle<T>(array: T[]): T[] {
//   return array
//     .map((item) => ({ item, sort: Math.random() }))
//     .sort((a, b) => a.sort - b.sort)
//     .map(({ item }) => item);
// }

// // ----------------------------------
// // GET — Fetch & Shuffle Exam
// // ----------------------------------
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ examId: string }> }
// ) {
//   try {
//     await dbConnect();

//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { examId } = await context.params;

//     // Fetch exam + questions
//     const examDoc = await Exam.findById(examId)
//       .populate({
//         path: "questions",
//         select: "text options correctOption subject department difficulty createdBy createdAt",
//       })
//       .lean();

//     if (!examDoc) {
//       return NextResponse.json(
//         { success: false, message: "Exam not found" },
//         { status: 404 }
//       );
//     }

//     // Cast examDoc to a strict type
//     const exam = examDoc as unknown as IExamPopulated;

//     // 🔀 Shuffle question order
//     const shuffledQuestions: IQuestionPopulated[] = shuffle(exam.questions).map(
//       (q) => ({
//         ...q,
//         // 🔀 Shuffle options (strings)
//         options: shuffle(q.options),
//       })
//     );

//     const response: IExamPopulated = {
//       ...exam,
//       questions: shuffledQuestions,
//     };

//     return NextResponse.json(
//       { success: true, exam: response },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Fetch Exam Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }








//CLAUDE SOLUTION
//RANDOMIZING QUESTIONS - FIXED
// import { NextResponse, NextRequest } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Exam from "@/models/Exam";
// import { getCurrentUser } from "@/lib/auth";
// import { IExamPopulated, IQuestionPopulated } from "@/types/exam-types";

// // ----------------------------------
// // GENERIC SHUFFLE FUNCTION (TYPED)
// // ----------------------------------
// function shuffle<T>(array: T[]): T[] {
//   return array
//     .map((item) => ({ item, sort: Math.random() }))
//     .sort((a, b) => a.sort - b.sort)
//     .map(({ item }) => item);
// }

// // ----------------------------------
// // GET — Fetch & Shuffle Exam
// // ----------------------------------
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ examId: string }> }
// ) {
//   try {
//     await dbConnect();

//     const user = await getCurrentUser();
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { examId } = await context.params;

//     // Fetch exam + questions
//     const examDoc = await Exam.findById(examId)
//       .populate({
//         path: "questions",
//         select: "text options correctOption subject department difficulty createdBy createdAt",
//       })
//       .lean();

//     if (!examDoc) {
//       return NextResponse.json(
//         { success: false, message: "Exam not found" },
//         { status: 404 }
//       );
//     }

//     // Cast examDoc to a strict type
//     const exam = examDoc as unknown as IExamPopulated;

//     // 🔀 Shuffle question order
//     const shuffledQuestions: IQuestionPopulated[] = shuffle(exam.questions).map(
//       (q) => {
//         // ✅ FIX: Get the actual correct answer text BEFORE shuffling
//         const correctAnswerText = q.options[q.correctOption];
        
//         // 🔀 Shuffle options
//         const shuffledOptions = shuffle(q.options);
        
//         // ✅ FIX: Find the new index of the correct answer AFTER shuffling
//         const newCorrectOption = shuffledOptions.indexOf(correctAnswerText);

//         return {
//           ...q,
//           options: shuffledOptions,
//           correctOption: newCorrectOption, // ✅ Updated index
//         };
//       }
//     );

//     const response: IExamPopulated = {
//       ...exam,
//       questions: shuffledQuestions,
//     };

//     return NextResponse.json(
//       { success: true, exam: response },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Fetch Exam Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 }
//     );
//   }
// }








import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Exam from "@/models/Exam";
import { getCurrentUser } from "@/lib/auth";
import { IExamPopulated, IQuestionPopulated } from "@/types/exam-types";

// Generic shuffle for questions
function shuffle<T>(array: T[]): T[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// GET — Fetch & Shuffle Questions Only
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    await dbConnect();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await context.params;

    // Fetch exam + questions
    const examDoc = await Exam.findById(examId)
      .populate({
        path: "questions",
        select: "text options correctOption subject department difficulty createdBy createdAt",
      })
      .lean();

    if (!examDoc) {
      return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
    }

    const exam = examDoc as unknown as IExamPopulated;

    // 🔀 Shuffle questions only
    const shuffledQuestions: IQuestionPopulated[] = shuffle(exam.questions);

    const response: IExamPopulated = {
      ...exam,
      questions: shuffledQuestions,
    };

    return NextResponse.json({ success: true, exam: response }, { status: 200 });
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
