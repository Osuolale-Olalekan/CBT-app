// app/api/questions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";
import { getCurrentUser } from "@/lib/auth";

// ✅ Update Question (Admin only)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { text, options, correctOption, department, subject, difficulty } =
      body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        ...(text && { text: text.trim() }),
        ...(options && { options: options.map((opt: string) => opt.trim()) }),
        ...(correctOption !== undefined && { correctOption }),
        ...(department && { department }),
        ...(subject && { subject: subject.trim() }),
        ...(difficulty && { difficulty }),
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (error) {
    console.error("Update Question Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Delete Question (Admin only)
export async function DELETE(
  req: NextRequest, context : { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const {id} = await context.params
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Question deleted" });
  } catch (error) {
    console.error("Delete Question Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
