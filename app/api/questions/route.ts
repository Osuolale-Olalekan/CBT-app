// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Question from "@/models/Question";
// import { getCurrentUser } from "@/lib/auth"; // you already use this in Dashboard


// // ✅ Create Question (Admin only)
// export async function POST(req: Request) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();
//     if (!user || (user.role !== "admin")) {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
//     }

//     const body = await req.json();
//     const { text, options, correctOption, department, subject, difficulty } = body;

//     if (!text || !options || options.length < 2 || correctOption == null) {
//       return NextResponse.json({ success: false, message: "Invalid question data" }, { status: 400 });
//     }

//     const newQuestion = await Question.create({
//       text,
//       options,
//       correctOption,
//       department,
//       subject,
//       difficulty,
//       createdBy: user.id,
//     });

//     return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
//   } catch (error) {
//     console.error("Create Question Error:", error);
//     return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
//   }
// }

// // ✅ Get All Questions (Admin/Teacher)
// export async function GET() {
//   try {
//     await dbConnect();
//     const questions = await Question.find().sort({ createdAt: -1 });
//     return NextResponse.json({ success: true, questions });
//   } catch (error)
//    {
//     return NextResponse.json({ success: false, message: "Failed to fetch questions" }, { status: 500 });
//   }
// }




//
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";
import { getCurrentUser } from "@/lib/auth";

// ✅ Create Question (Admin Only)
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
    const { text, options, correctOption, department, subject, difficulty } = body;

    if (!text || !options || options.length < 2 || correctOption == null) {
      return NextResponse.json(
        { success: false, message: "Invalid question data" },
        { status: 400 }
      );
    }

    const newQuestion = await Question.create({
      text,
      options,
      correctOption,
      department,
      subject,
      difficulty,
      createdBy: user.id,
    });

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error("Create Question Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Get All Questions (Admin or Student)
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

    let query = {};

    // ✅ Admin → all questions
    // ✅ Student → only questions for their department or "General"
    if (user.role === "student") {
      query = {
        $or: [
          { department: user.department },
          { department: "General" },
        ],
      };
    }

    const questions = await Question.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Fetch Questions Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
