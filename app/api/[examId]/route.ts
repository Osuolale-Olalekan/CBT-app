// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Result from "@/models/Result";
// import { getCurrentUser } from "@/lib/auth";

// export async function GET(
//   req: Request,
//   { params }: { params: { examId: string } }
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

//     const { examId } = params;

//     // If admin, return all results for this exam
//     if (user.role === "admin") {
//       const results = await Result.find({ examId })
//         .populate("userId", "name email")
//         .sort({ percentage: -1 }); // ranking

//       return NextResponse.json({ success: true, results });
//     }

//     // Otherwise, student can only see their own result
//     const result = await Result.findOne({ examId, userId: user.id }).populate(
//       "examId",
//       "title description totalQuestions"
//     );

//     if (!result) {
//       return NextResponse.json(
//         { success: false, message: "Result not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ success: true, result });
//   } catch (error) {
//     console.error("Fetch Result Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server Error" },
//       { status: 500 }
//     );
//   }
// }

// app/api/results/[examId]/route.ts
// app/api/results/[examId]/route.ts





// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Result from "@/models/Result";
// import { getCurrentUser } from "@/lib/auth";

// export async function GET(
//   req: Request,
//   { params }: { params: { examId: string } }
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

//     const examId = params.examId;

//     if (user.role === "admin") {
//       // ✅ Admin sees all results with ranking
//       const results = await Result.find({ examId })
//         .populate("userId", "name email")
//         .sort({ percentage: -1 });

//       // Assign ranks
//       const rankedResults = results.map((r, index) => ({
//         ...r.toObject(),
//         rank: index + 1,
//       }));

//       // ✅ Compute stats
//       const totalStudents = results.length;
//       const classAverage =
//         totalStudents > 0
//           ? results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents
//           : 0;

//       const highestScore = results[0]?.percentage || 0;

//       return NextResponse.json({
//         success: true,
//         results: rankedResults,
//         stats: {
//           totalStudents,
//           classAverage,
//           highestScore,
//         },
//       });
//     } else {
//       // ✅ Student sees only their result
//       const result = await Result.findOne({ examId, userId: user.id }).populate(
//         "userId",
//         "name email"
//       );

//       if (!result) {
//         return NextResponse.json(
//           { success: false, message: "No result found" },
//           { status: 404 }
//         );
//       }

//       // Compute rank of this student
//       const allResults = await Result.find({ examId }).sort({ percentage: -1 });
//       const rank =
//         allResults.findIndex(
//           (r) => r.userId.toString() === user.id.toString()
//         ) + 1;

//       return NextResponse.json({
//         success: true,
//         result: {
//           ...result.toObject(),
//           rank,
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Get Results Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server Error" },
//       { status: 500 }
//     );
//   }
// }

