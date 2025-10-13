// lib/models/Result.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOption: number | null;
  isCorrect: boolean;
}

export interface IResult extends Document {
  userId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  percentage: number;
  timeSpent: number; // in seconds
  submittedAt: Date;
  autoSubmitted: boolean;
  sessionId: mongoose.Types.ObjectId;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOption: {
      type: Number,
      required: false,
      default: null,
      min: 0,
      max: 3,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false
    },
  },
  { _id: false }
);

const ResultSchema = new Schema<IResult>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    sessionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Session" ,
      required: false,
    },
    answers: [AnswerSchema],
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ResultSchema.index({ userId: 1, examId: 1 });
ResultSchema.index({ examId: 1, percentage: -1 });

export default mongoose.models.Result ||
  mongoose.model<IResult>("Result", ResultSchema);
