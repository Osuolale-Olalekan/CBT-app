// lib/actions/question.ts
import Question, { IQuestion } from '../models/Question';
import mongoose, { FilterQuery } from 'mongoose';
import dbConnect from './dbConnect';

// export interface PublicQuestion {
//   id: string;
//   text: string;
//   options: string[];
//   correctOption: number;
//   department: "Science" | "Art" | "Commercial" | "General";
//   subject: string;
//   difficulty: "Easy" | "Medium" | "Hard";
//   createdBy: { id: string; name: string };
//   createdAt: Date;
//   updatedAt: Date;
// }


export interface CreateQuestionData {
  text: string;
  options: string[];
  correctOption: number;
  department: 'Science' | 'Art' | 'Commercial' | 'General';
  subject: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  createdBy: string;
}

export interface UpdateQuestionData {
  text?: string;
  options?: string[];
  correctOption?: number;
  department?: 'Science' | 'Art' | 'Commercial' | 'General';
  subject?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

// function toPublicQuestion(doc: IQuestion & { createdBy: string }): PublicQuestion {
//   return {
//     id: doc._id.toString(),
//     text: doc.text,
//     options: doc.options,
//     correctOption: doc.correctOption,
//     department: doc.department,
//     subject: doc.subject,
//     difficulty: doc.difficulty,
//     createdBy: {
//       id: doc.createdBy._id?.toString?.() || doc.createdBy.toString(),
//       name: doc.createdBy.name || "",
//     },
//     createdAt: doc.createdAt,
//     updatedAt: doc.updatedAt,
//   };
// }


export async function createQuestion(questionData: CreateQuestionData): Promise<{ success: boolean; message: string; question?: IQuestion }> {
  try {
    await dbConnect();

    // Validate options array
    if (!questionData.options || questionData.options.length !== 4) {
      return { success: false, message: 'Question must have exactly 4 options' };
    }

    // Validate correct option index
    if (questionData.correctOption < 0 || questionData.correctOption > 3) {
      return { success: false, message: 'Correct option must be between 0 and 3' };
    }

    const question = new Question({
      ...questionData,
      createdBy: new mongoose.Types.ObjectId(questionData.createdBy)
    });

    await question.save();

    return {
      success: true,
      message: 'Question created successfully',
      question: question.toObject()
    };
  } catch (error: unknown) {
    return { success: false, message: 'Failed to create question' };
  }
}

export async function getQuestionsByDepartment(department: string, includeGeneral: boolean = true): Promise<IQuestion[]> {
  try {
    await dbConnect();
    
    const filter: FilterQuery<IQuestion> = {};
    
    if (includeGeneral) {
      filter.$or = [{ department }, { department: 'General' }];
    } else {
      filter.department = department;
    }

    return await Question.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
  } catch (error) {
    return [];
  }
}

export async function getQuestionsBySubject(subject: string): Promise<IQuestion[]> {
  try {
    await dbConnect();
    return await Question.find({ subject })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
  } catch (error) {
    return [];
  }
}

export async function getAllQuestions(): Promise<IQuestion[]> {
  try {
    await dbConnect();
    return await Question.find({})
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
  } catch (error) {
    return [];
  }
}

export async function updateQuestion(questionId: string, updateData: UpdateQuestionData): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();
    
    const question = await Question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!question) {
      return { success: false, message: 'Question not found' };
    }

    return { success: true, message: 'Question updated successfully' };
  } catch (error: unknown) {
    return { success: false, message: 'Failed to update question' };
  }
}

export async function deleteQuestion(questionId: string): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect();
    
    const question = await Question.findByIdAndDelete(questionId);

    if (!question) {
      return { success: false, message: 'Question not found' };
    }

    return { success: true, message: 'Question deleted successfully' };
  } catch (error: unknown) {
    return { success: false, message: 'Failed to delete question' };
  }
}