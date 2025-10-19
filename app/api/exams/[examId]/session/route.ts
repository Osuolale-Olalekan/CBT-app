//changed it to this to fix route params for nextjs v15
// app/api/exams/[examId]/session/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Session from "@/models/Session";
import Exam from "@/models/Exam";
import { getCurrentUser } from "@/lib/auth";

// ✅ GET → restore session
export async function GET(req: NextRequest, context: { params: Promise<{ examId: string }> }) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { examId } = await context.params;

    const existingSession = await Session.findOne({
      examId,
      userId: user.id,
    });

    if (!existingSession) {
      return NextResponse.json({ error: "No session found" }, { status: 404 });
    }

    return NextResponse.json({ session: existingSession });
  } catch (error) {
    console.error("Get Session Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST → start new session
export async function POST(req: NextRequest, context: { params: Promise<{ examId: string }> }) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { examId } = await context.params;

    // check exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // check if session already exists
    const existingSession = await Session.findOne({
      examId,
      userId: user.id,
    });

    if (existingSession) {
      return NextResponse.json({ session: existingSession });
    }

    // create new session
    const newSession = await Session.create({
      examId,
      userId: user.id,
      startTime: new Date(),
    });

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error("Create Session Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ PUT → update/end session
export async function PUT(req: NextRequest, context: { params: Promise<{ examId: string }> }) {
  try {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { examId } = await context.params;
    const body = await req.json();
    const { endTime, submittedAt } = body;

    const updatedSession = await Session.findOneAndUpdate(
      { examId, userId: user.id },
      { endTime, submittedAt },
      { new: true }
    );

    if (!updatedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Update Session Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}









// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Session from "@/models/Session";
// import Exam from "@/models/Exam";
// import { getCurrentUser } from "@/lib/auth";

// // GET → restore session
// export async function GET(
//   req: Request,
//   { params }: { params: { examId: string } }
// ) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const existingSession = await Session.findOne({
//       examId: params.examId,
//       userId: user.id,
//     });

//     if (!existingSession) {
//       return NextResponse.json({ error: "No session found" }, { status: 404 });
//     }

//     return NextResponse.json({ session: existingSession });
//   } catch (error) {
//     console.error("Get Session Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // POST → start new session
// export async function POST(
//   req: Request,
//   { params }: { params: { examId: string } }
// ) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     // check exam exists
//     const exam = await Exam.findById(params.examId);
//     if (!exam) {
//       return NextResponse.json({ error: "Exam not found" }, { status: 404 });
//     }

//     // check if session already exists
//     const existingSession = await Session.findOne({
//       examId: params.examId,
//       userId: user.id,
//     });

//     if (existingSession) {
//       return NextResponse.json({ session: existingSession });
//     }

//     // create new session
//     const newSession = await Session.create({
//       examId: params.examId,
//       userId: user.id,
//       startTime: new Date(),
//     });

//     return NextResponse.json({ session: newSession });
//   } catch (error) {
//     console.error("Create Session Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // PUT → update/end session
// export async function PUT(
//   req: Request,
//   { params }: { params: { examId: string } }
// ) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const body = await req.json();
//     const { endTime, submittedAt } = body;

//     const updatedSession = await Session.findOneAndUpdate(
//       { examId: params.examId, userId: user.id },
//       { endTime, submittedAt },
//       { new: true }
//     );

//     if (!updatedSession) {
//       return NextResponse.json({ error: "Session not found" }, { status: 404 });
//     }

//     return NextResponse.json({ session: updatedSession });
//   } catch (error) {
//     console.error("Update Session Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }









// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/actions/dbConnect";
// import Session from "@/lib/models/Session";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"; // adjust this import to your auth config

// // GET → restore session
// export async function GET(
//   req: Request,
//   { params }: { params: { examId: string } }
// ) {
//   try {
//     await dbConnect();
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const existingSession = await Session.findOne({
//       examId: params.examId,
//       userId: session.user.id,
//     });

//     if (!existingSession) {
//       return NextResponse.json(
//         { error: "No session found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ session: existingSession });
//   } catch (error) {
//     console.error("Get Session Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // POST → start new session
// export async function POST(
//   req: Request,
//   { params }: { params: { examId: string } }
// ) {
//   try {
//     await dbConnect();
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // check if a session already exists
//     let existingSession = await Session.findOne({
//       examId: params.examId,
//       userId: session.user.id,
//     });

//     if (existingSession) {
//       return NextResponse.json({ session: existingSession });
//     }

//     // create a new session
//     const newSession = await Session.create({
//       examId: params.examId,
//       userId: session.user.id,
//       startTime: new Date(),
//     });

//     return NextResponse.json({ session: newSession });
//   } catch (error) {
//     console.error("Create Session Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // PUT → end or submit session
// export async function PUT(
//   req: Request,
//   { params }: { params: { examId: string } }
// ) {
//   try {
//     await dbConnect();
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { endTime, submittedAt } = body;

//     const updatedSession = await Session.findOneAndUpdate(
//       { examId: params.examId, userId: session.user.id },
//       { endTime, submittedAt },
//       { new: true }
//     );

//     if (!updatedSession) {
//       return NextResponse.json({ error: "Session not found" }, { status: 404 });
//     }

//     return NextResponse.json({ session: updatedSession });
//   } catch (error) {
//     console.error("Update Session Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }



// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Exam from "@/models/Exam";
// // import ExamSession from "@/models/ExamSession"; 
// import ExamSession from "@/models/ExamSession";
// import { getCurrentUser } from "@/lib/auth"; // assumes your auth helper returns user info

// export async function POST(
//   req: Request,
//   { params }: { params: { examId: string } }
// ) {
//   try {
//     await dbConnect();
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//     }

//     const exam = await Exam.findById(params.examId);
//     if (!exam) {
//       return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
//     }

//     // Check if student already started
//     let session = await ExamSession.findOne({ examId: params.examId, studentId: user.id });

//     if (!session) {
//       // Create a new session
//       session = await ExamSession.create({
//         examId: params.examId,
//         studentId: user.id,
//         startTime: new Date(),
//         duration: exam.duration,
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       exam: {
//         _id: exam._id,
//         title: exam.title,
//         duration: exam.duration,
//         totalQuestions: exam.totalQuestions,
//         department: exam.department,
//         questions: exam.questions,
//       },
//       startTime: session.startTime,
//     });
//   } catch (error) {
//     console.error("Error starting exam:", error);
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }
