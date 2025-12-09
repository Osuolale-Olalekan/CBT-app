// lib/models/Question.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId,
  text: string;
  options: string[] | string;
  correctOption: number;
  department: 'JSS 1' | 'JSS 2' | 'JSS 3' | 'General'; //might revert to department mode if class mode fail
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctOption: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  department: {
    type: String,
    enum: ['JSS 1', 'JSS 2', 'JSS 3', 'General'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

QuestionSchema.index({ department: 1, subject: 1 });

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
