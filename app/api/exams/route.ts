// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Exam from "@/models/Exam";
// import Question from "@/models/Question";
// import { getCurrentUser } from "@/lib/auth";

// // ✅ Create Exam (Admin Only)
// export async function POST(req: Request) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();
//     if (!user || user.role !== "admin") {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//     }

//     const body = await req.json();
//     const { title, description, duration, department, questions, passingScore } = body;

//     if (!title || !duration || !department || !questions || questions.length === 0) {
//       return NextResponse.json({ success: false, message: "Invalid exam data" }, { status: 400 });
//     }

//     // Validate questions exist
//     const validQuestions = await Question.find({ _id: { $in: questions } });
//     if (validQuestions.length !== questions.length) {
//       return NextResponse.json({ success: false, message: "Some questions not found" }, { status: 400 });
//     }

//     const newExam = await Exam.create({
//       title,
//       description,
//       duration,
//       department,
//       questions,
//       totalQuestions: questions.length,
//       passingScore: passingScore || 50,
//       createdBy: user.id,
//     });

//     return NextResponse.json({ success: true, exam: newExam }, { status: 201 });
//   } catch (error) {
//     console.error("Create Exam Error:", error);
//     return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
//   }
// }

// // ✅ Get All Exams (Students/Everyone)
// export async function GET() {
//   try {
//     await dbConnect();
//     const exams = await Exam.find({ isActive: true })
//       .populate("questions", "text subject difficulty")
//       .sort({ createdAt: -1 });

//     return NextResponse.json({ success: true, exams });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: "Failed to fetch exams" }, { status: 500 });
//   }
// }

//start exam endpoint
//api/exams/[examId]
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import { getCurrentUser } from "@/lib/auth";

// ✅ Create Exam (Admin Only)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, duration, department, questions, passingScore } = body;

    if (!title || !duration || !department || !questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid exam data" },
        { status: 400 }
      );
    }

    // Validate questions exist
    const validQuestions = await Question.find({ _id: { $in: questions } });
    if (validQuestions.length !== questions.length) {
      return NextResponse.json(
        { success: false, message: "Some questions not found" },
        { status: 400 }
      );
    }

    const newExam = await Exam.create({
      title,
      description,
      duration,
      department,
      questions,
      totalQuestions: questions.length,
      passingScore: passingScore || 50,
      createdBy: user.id,
    });

    return NextResponse.json({ success: true, exam: newExam }, { status: 201 });
  } catch (error) {
    console.error("Create Exam Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Get All Exams (Filtered by User Role)
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

    // ✅ If admin → show all exams
    // ✅ If student → show only department or "General"
    const query =
      user.role === "admin"
        ? { isActive: true }
        : {
            isActive: true,
            $or: [
              { department: user.department },
              { department: "General" },
            ],
          };

    const exams = await Exam.find(query)
      .populate("questions", "text subject difficulty")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    console.error("Fetch Exams Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
