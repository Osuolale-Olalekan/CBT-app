import mongoose, { Schema, Document } from "mongoose";

export interface ISessionAnswer {
  questionId: string;
  selectedOption: number;
}

export interface ISession extends Document {
  examId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers: ISessionAnswer[];
  startTime: Date;
  endTime?: Date;
  submittedAt?: Date;
  isSubmitted: boolean;
}

const SessionSchema = new Schema<ISession>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOption: { type: Number, required: true },
      },
    ],
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    submittedAt: { type: Date },
    isSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
