// lib/models/Exam.ts
import mongoose, { Document, Schema } from 'mongoose';
// import mongoose, { Schema, model, models, Document, Model, Types } from "mongoose";

export interface IExam extends Document {
  title: string;
  description?: string;
  duration: number; // in minutes
  department: 'Science' | 'Art' | 'Commercial';
  questions: mongoose.Types.ObjectId[];
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ExamSchema = new Schema<IExam>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 10 // minimum 10 minutes
  },
  department: {
    type: String,
    enum: ['Science', 'Art', 'Commercial'],
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  totalQuestions: {
    type: Number,
    required: true
  },
  passingScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

ExamSchema.index({ department: 1, isActive: 1 });

export default mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);
