// // /app/api/questions/bulk/route.ts

// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Question from "@/models/Question";
// import { getCurrentUser } from "@/lib/auth";
// import mongoose from "mongoose";

// export async function POST(req: Request) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();

//     // ✅ Only admin can bulk upload
//     if (!user || user.role !== "admin") {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 403 }
//       );
//     }

//     const { questions } = await req.json();

//     if (!Array.isArray(questions) || questions.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "No questions provided" },
//         { status: 400 }
//       );
//     }

//     // ✅ Validate and normalize each question
//     const validQuestions = questions
//       .filter((q) => {
//         const valid =
//           q.text &&
//           Array.isArray(q.options) &&
//           q.options.length === 4 && // exactly 4 options required
//           typeof q.correctOption === "number" &&
//           q.correctOption >= 0 &&
//           q.correctOption <= 3 &&
//           q.department &&
//           q.subject;

//         return valid;
//       })
//       .map((q) => ({
//         text: q.text.trim(),
//         options: q.options.map((o: string) => o.trim()),
//         correctOption: q.correctOption,
//         department: q.department,
//         subject: q.subject.trim(),
//         difficulty: q.difficulty || "Medium",
//         createdBy: new mongoose.Types.ObjectId(user.id),
//       }));

//     if (validQuestions.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "No valid questions found" },
//         { status: 400 }
//       );
//     }

//     // ✅ Insert all at once
//     const inserted = await Question.insertMany(validQuestions);

//     return NextResponse.json({
//       success: true,
//       message: `${inserted.length} questions uploaded successfully`,
//       questions: inserted,
//     });
//   } catch (error: unknown) {
//     // ✅ Type-safe error handling
//     const message =
//       error instanceof Error ? error.message : "Unexpected server error";

//     console.error("Bulk Upload Error:", message);
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question, { IQuestion } from "@/models/Question";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";
import Papa from "papaparse"; // Make sure you have installed: npm i papaparse @types/papaparse

export const runtime = "nodejs"; // Allows file parsing in server environment

export async function POST(req: Request) {
  try {
    // 1️⃣ Connect to database and check user
    await dbConnect();
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // 2️⃣ Retrieve uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const text = await file.text();
    let questions: IQuestion[] = [];

    // 3️⃣ Detect file type and parse accordingly
    if (file.name.endsWith(".json")) {
      const json = JSON.parse(text);
      questions = Array.isArray(json.questions) ? json.questions : json;
    } else if (file.name.endsWith(".csv")) {
      const parsed = Papa.parse(text, { header: true });
      questions = parsed.data as unknown as IQuestion[];
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported file type. Please upload a .json or .csv file.",
        },
        { status: 400 }
      );
    }

    // 4️⃣ Normalize and validate each question
    const validQuestions = questions
      .map((q) => {
        let opts: string[] = [];

        try {
          // Normalize options — handle JSON arrays and string arrays from CSV
          if (Array.isArray(q.options)) {
            opts = q.options;
          } else if (typeof q.options === "string") {
            // Replace single quotes with double quotes if needed
            const fixed = q.options.replace(/'/g, '"');
            opts = JSON.parse(fixed);
          }
        } catch {
          opts = [];
        }

        return {
          text: q.text?.trim(),
          options: opts.map((o) => o.trim()),
          correctOption: Number(q.correctOption),
          department: q.department,
          subject: q.subject?.trim(),
          difficulty: q.difficulty || "Medium",
          createdBy: new mongoose.Types.ObjectId(user.id),
        };
      })
      .filter(
        (q) =>
          q.text &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctOption === "number" &&
          q.correctOption >= 0 &&
          q.correctOption <= 3 &&
          q.department &&
          q.subject
      );

    // 5️⃣ Handle invalid or empty uploads
    if (validQuestions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid questions found in file." },
        { status: 400 }
      );
    }

    // 6️⃣ Bulk insert into database
    const inserted = await Question.insertMany(validQuestions);

    return NextResponse.json({
      success: true,
      message: `${inserted.length} questions uploaded successfully.`,
      questions: inserted,
    });
  } catch (error: unknown) {
    // 7️⃣ Handle server-side errors
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    console.error("❌ Bulk Upload Error:", message);
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

