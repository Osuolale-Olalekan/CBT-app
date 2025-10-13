// import mongoose from "mongoose";

// const ExamSessionSchema = new mongoose.Schema({
//   examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   startTime: { type: Date, required: true },
//   duration: { type: Number, required: true }, // in minutes
// }, { timestamps: true });

// export default mongoose.models.ExamSession || mongoose.model("ExamSession", ExamSessionSchema);


// lib/models/ExamSession.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IExamSession extends Document {
  student: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  startTime: Date;
  answers: { questionId: mongoose.Types.ObjectId; selectedOption: number }[];
  isSubmitted: boolean;
}

const ExamSessionSchema = new Schema<IExamSession>({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  startTime: { type: Date, required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedOption: Number,
    },
  ],
  isSubmitted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.ExamSession ||
  mongoose.model<IExamSession>("ExamSession", ExamSessionSchema);
