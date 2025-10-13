// app/api/submits/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import ExamSession from "@/models/ExamSession";
import { IQuestion } from "@/models/Question";
import { getCurrentUser } from "@/lib/auth";

interface SubmittedAnswer {
  questionId: string;
  selectedOption: number;
}

export async function GET() {
  return new Response("Submits API is alive", { status: 200 });
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { examId, answers, timeSpent, autoSubmitted } = await req.json();

    // ✅ Validate Exam
    const exam = await Exam.findById(examId).populate("questions");
    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    // ✅ Prevent multiple submissions
    const existing = await Result.findOne({ userId: user.id, examId });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Exam already submitted" },
        { status: 400 }
      );
    }

    // ✅ Fetch session (to merge answers)
    const session = await ExamSession.findOne({
      student: user.id,
      exam: examId,
    });
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Exam session not found" },
        { status: 404 }
      );
    }
    if (session.isSubmitted) {
      return NextResponse.json(
        { success: false, message: "Session already submitted" },
        { status: 400 }
      );
    }

    // ✅ Merge client answers with session (in case some didn’t sync)
    const finalAnswers: SubmittedAnswer[] =
      answers && answers.length > 0 ? answers : session.answers;

    // ✅ Counters
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    // ✅ Process answers
    // const processedAnswers = (exam.questions as IQuestion[]).map((q) => {
    //   const answer = finalAnswers.find((a) => a.questionId === q._id.toString());

    //   if (!answer) {
    //     unansweredCount++;
    //     return { questionId: q._id, selectedOption: null, isCorrect: false };
    //   }

    //   const isCorrect = answer.selectedOption === q.correctOption;
    //   if (isCorrect) correctCount++;
    //   else wrongCount++;

    //   return { questionId: q._id, selectedOption: answer.selectedOption, isCorrect };
    // });

    // ✅ Process answers
    const processedAnswers = (exam.questions as IQuestion[]).map((q) => {
      const answer = finalAnswers.find(
        (a) => a.questionId === q._id.toString()
      );

      // Check if answer is missing OR if selectedOption is null/undefined
      if (
        !answer ||
        answer.selectedOption === null ||
        answer.selectedOption === undefined
      ) {
        unansweredCount++;
        return { questionId: q._id, selectedOption: null, isCorrect: false };
      }

      const isCorrect = answer.selectedOption === q.correctOption;
      if (isCorrect) correctCount++;
      else wrongCount++;

      return {
        questionId: q._id,
        selectedOption: answer.selectedOption,
        isCorrect,
      };
    });

    // ✅ Score calculation
    const score = correctCount;
    const percentage = (score / exam.totalQuestions) * 100;

    // ✅ Save result
    const newResult = await Result.create({
      userId: user.id,
      examId,
      answers: processedAnswers,
      score,
      percentage,
      timeSpent,
      autoSubmitted: !!autoSubmitted,
    });

    // ✅ Mark session as submitted
    session.isSubmitted = true;
    await session.save();

    return NextResponse.json({
      success: true,
      resultId: newResult._id,
      result: newResult,
      stats: {
        totalQuestions: exam.totalQuestions,
        correct: correctCount,
        wrong: wrongCount,
        unanswered: unansweredCount,
        percentage,
      },
    });
  } catch (error) {
    console.error("Submit Exam Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Result from "@/models/Result";
// import Exam from "@/models/Exam";
// import { IQuestion } from "@/models/Question";
// import { getCurrentUser } from "@/lib/auth";

// interface SubmittedAnswer {
//   questionId: string;
//   selectedOption: number;
// }

// export async function GET() {
//   return new Response("Submits API is alive", { status: 200 });
// }

// export async function POST(req: Request) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//     }

//     const { examId, answers, timeSpent, autoSubmitted } = await req.json();

//     // Validate Exam
//     const exam = await Exam.findById(examId).populate("questions");
//     if (!exam) {
//       return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
//     }

//     // Check if already submitted
//     const existing = await Result.findOne({ userId: user.id, examId });
//     if (existing) {
//       return NextResponse.json({ success: false, message: "Exam already submitted" }, { status: 400 });
//     }

//     // Counters
//     let correctCount = 0;
//     let wrongCount = 0;
//     let unansweredCount = 0;

//     // Process answers
//     const processedAnswers = (exam.questions as IQuestion[]).map((q) => {
//       const answer = answers.find((a: SubmittedAnswer) => a.questionId === q._id.toString());

//       if (!answer) {
//         unansweredCount++;
//         return { questionId: q._id, selectedOption: null, isCorrect: false };
//       }

//       const isCorrect = answer.selectedOption === q.correctOption;
//       if (isCorrect) correctCount++;
//       else wrongCount++;

//       return { questionId: q._id, selectedOption: answer.selectedOption, isCorrect };
//     });

//     // Score calculation
//     const score = correctCount;
//     const percentage = (score / exam.totalQuestions) * 100;

//     // Save result
//     const newResult = await Result.create({
//       userId: user.id,
//       examId,
//       answers: processedAnswers,
//       score,
//       percentage,
//       timeSpent,
//       autoSubmitted: !!autoSubmitted,
//     });

//     return NextResponse.json({
//       success: true,
//       resultId: newResult._id,
//       result: newResult,
//       stats: {
//         totalQuestions: exam.totalQuestions,
//         correct: correctCount,
//         wrong: wrongCount,
//         unanswered: unansweredCount,
//         percentage,
//       },
//     });
//   } catch (error) {
//     console.error("Submit Exam Error:", error);
//     return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
//   }
// }
