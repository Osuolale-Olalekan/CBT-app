// lib/actions/result.ts - Complete fixed version with no type errors

import Result, { IResult, IAnswer } from "../models/Result";
import Question, { IQuestion } from "../models/Question";
import Exam, { IExam } from "../models/Exam";
import User, { IUser } from "../models/User";
import mongoose from "mongoose";
import dbConnect from "./dbConnect";

// ==================== TYPE DEFINITIONS ====================

// Type for analytics results after population
type AnalyticsResultDoc = {
  _id: mongoose.Types.ObjectId;
  userId: {
    _id: mongoose.Types.ObjectId;
    department: string;
  };
  examId: {
    _id: mongoose.Types.ObjectId;
    passingScore: number;
  };
  percentage: number;
  score: number;
  timeSpent: number;
  submittedAt: Date;
  autoSubmitted: boolean;
};

// Type for fully populated result with all details
export type PopulatedResult = {
  _id: mongoose.Types.ObjectId;
  userId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    department?: string;
  };
  examId: {
    _id: mongoose.Types.ObjectId;
    title: string;
    department: string;
    passingScore: number;
  };
  answers: Array<{
    questionId: {
      _id: mongoose.Types.ObjectId;
      text: string;
      options: string[];
      correctOption: number;
      subject: string;
      department: string;
    };
    selectedOption: number;
    isCorrect: boolean;
  }>;
  percentage: number;
  score: number;
  timeSpent: number;
  submittedAt: Date;
  autoSubmitted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Type for simple populated results (list views)
export type SimplePopulatedResult = {
  _id: mongoose.Types.ObjectId;
  userId?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    department?: string;
  };
  examId: {
    _id: mongoose.Types.ObjectId;
    title: string;
    department?: string;
    duration?: number;
  };
  percentage: number;
  score: number;
  timeSpent: number;
  submittedAt: Date;
  autoSubmitted: boolean;
};

export interface SubmitExamData {
  userId: string;
  examId: string;
  answers: { questionId: string; selectedOption: number }[];
  timeSpent: number;
  autoSubmitted?: boolean;
}

export interface ResultAnalytics {
  totalStudents: number;
  averageScore: number;
  passingRate: number;
  departmentStats: {
    [department: string]: {
      totalStudents: number;
      averageScore: number;
      passingRate: number;
    };
  };
}

export interface SubmitExamResult {
  success: boolean;
  message: string;
  result?: {
    id: mongoose.Types.ObjectId;
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
  };
}

// ==================== MAIN FUNCTIONS ====================

export async function submitExam(
  examData: SubmitExamData
): Promise<SubmitExamResult> {
  try {
    await dbConnect();

    // Get exam details
    const exam = await Exam.findById(examData.examId);
    
    if (!exam) {
      return { success: false, message: "Exam not found" };
    }

    // Check if user has already submitted this exam
    const existingResult = await Result.findOne({
      userId: examData.userId,
      examId: examData.examId,
    });

    if (existingResult) {
      return {
        success: false,
        message: "You have already submitted this exam",
      };
    }

    // Process answers and calculate score
    const processedAnswers: IAnswer[] = [];
    let correctAnswers = 0;

    for (const answer of examData.answers) {
      const question = await Question.findById(answer.questionId);
      if (question) {
        const isCorrect = question.correctOption === answer.selectedOption;
        if (isCorrect) correctAnswers++;

        processedAnswers.push({
          questionId: new mongoose.Types.ObjectId(answer.questionId),
          selectedOption: answer.selectedOption,
          isCorrect,
        });
      }
    }

    const percentage = Math.round((correctAnswers / exam.totalQuestions) * 100);

    // Create result record
    const result = new Result({
      userId: new mongoose.Types.ObjectId(examData.userId),
      examId: new mongoose.Types.ObjectId(examData.examId),
      answers: processedAnswers,
      score: correctAnswers,
      percentage,
      timeSpent: examData.timeSpent,
      autoSubmitted: examData.autoSubmitted || false,
    });

    await result.save();

    return {
      success: true,
      message: "Exam submitted successfully",
      result: {
        id: result._id,
        score: correctAnswers,
        totalQuestions: exam.totalQuestions,
        percentage,
        passed: percentage >= exam.passingScore,
      },
    };
  } catch (error: unknown) {
    console.error("Error submitting exam:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit exam",
    };
  }
}

export async function getResultById(resultId: string): Promise<PopulatedResult | null> {
  try {
    await dbConnect();

    const result = await Result.findById(resultId)
      .populate("userId", "name email department")
      .populate("examId", "title department passingScore")
      .populate({
        path: "answers.questionId",
        select: "text options correctOption subject department",
      })
      .lean<PopulatedResult>();

    return result;
  } catch (error) {
    console.error("Error fetching result:", error);
    return null;
  }
}

export async function getUserResults(userId: string): Promise<SimplePopulatedResult[]> {
  try {
    await dbConnect();

    const results = await Result.find({ userId })
      .populate("examId", "title department duration")
      .sort({ submittedAt: -1 })
      .lean<SimplePopulatedResult[]>();

    return results;
  } catch (error) {
    console.error("Error fetching user results:", error);
    return [];
  }
}

export async function getExamResults(examId: string): Promise<SimplePopulatedResult[]> {
  try {
    await dbConnect();

    const results = await Result.find({ examId })
      .populate("userId", "name email department")
      .populate("examId", "title")
      .sort({ percentage: -1 })
      .lean<SimplePopulatedResult[]>();

    return results;
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return [];
  }
}

export async function getAllResults(): Promise<SimplePopulatedResult[]> {
  try {
    await dbConnect();

    const results = await Result.find({})
      .populate("userId", "name email department")
      .populate("examId", "title department")
      .sort({ submittedAt: -1 })
      .lean<SimplePopulatedResult[]>();

    return results;
  } catch (error) {
    console.error("Error fetching all results:", error);
    return [];
  }
}

export async function getResultAnalytics(): Promise<ResultAnalytics> {
  try {
    await dbConnect();

    // Fetch and populate results
    const results = await Result.find({})
      .populate("userId", "department")
      .populate("examId", "passingScore")
      .lean<AnalyticsResultDoc[]>();

    // Filter out any results that don't have proper population
    const validResults = results.filter((result): result is AnalyticsResultDoc => {
      return (
        result != null &&
        result.userId != null &&
        typeof result.userId === 'object' &&
        'department' in result.userId &&
        result.examId != null &&
        typeof result.examId === 'object' &&
        'passingScore' in result.examId &&
        typeof result.percentage === 'number'
      );
    });

    const totalStudents = validResults.length;
    
    // Calculate average score
    const totalScore = validResults.reduce((sum, result) => {
      return sum + result.percentage;
    }, 0);
    const averageScore = totalStudents > 0 ? totalScore / totalStudents : 0;
    
    // Calculate passing rate
    const passingResults = validResults.filter((result) => {
      return result.percentage >= result.examId.passingScore;
    });
    const passingRate = totalStudents > 0 
      ? (passingResults.length / totalStudents) * 100 
      : 0;

    // Department-wise statistics
    const departmentStats: {
      [key: string]: {
        totalStudents: number;
        averageScore: number;
        passingRate: number;
      };
    } = {};

    const departments: Array<'Science' | 'Art' | 'Commercial'> = ["Science", "Art", "Commercial"];
    
    departments.forEach((dept) => {
      // Filter results for this department
      const deptResults = validResults.filter((result) => {
        return result.userId.department === dept;
      });
      
      const deptTotal = deptResults.length;
      
      // Calculate department average
      const deptTotalScore = deptResults.reduce((sum, result) => {
        return sum + result.percentage;
      }, 0);
      const deptAverage = deptTotal > 0 ? deptTotalScore / deptTotal : 0;
      
      // Calculate department passing rate
      const deptPassing = deptResults.filter((result) => {
        return result.percentage >= result.examId.passingScore;
      });
      const deptPassingRate = deptTotal > 0 
        ? (deptPassing.length / deptTotal) * 100 
        : 0;

      departmentStats[dept] = {
        totalStudents: deptTotal,
        averageScore: Math.round(deptAverage),
        passingRate: Math.round(deptPassingRate),
      };
    });

    return {
      totalStudents,
      averageScore: Math.round(averageScore),
      passingRate: Math.round(passingRate),
      departmentStats,
    };
  } catch (error) {
    console.error("Error getting result analytics:", error);
    return {
      totalStudents: 0,
      averageScore: 0,
      passingRate: 0,
      departmentStats: {},
    };
  }
}

// Helper function to check if result is fully populated
export function isFullyPopulatedResult(
  result: unknown
): result is PopulatedResult {
  if (!result || typeof result !== 'object') return false;
  
  const r = result as Record<string, unknown>;
  
  return (
    typeof r.userId === 'object' &&
    r.userId !== null &&
    'name' in r.userId &&
    typeof r.examId === 'object' &&
    r.examId !== null &&
    'title' in r.examId
  );
}