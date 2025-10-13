// // lib/actions/exam.ts

// import Exam, { IExam } from "../models/Exam";
// import Question, { IQuestion } from "../models/Question";
// import mongoose from "mongoose";
// import dbConnect from "./dbConnect";

// export interface CreateExamData {
//   title: string;
//   description?: string;
//   duration: number;
//   department: "Science" | "Art" | "Commercial";
//   passingScore?: number;
//   createdBy: string;
//   questionFilters: {
//     general: { math: number; english: number };
//     departmentSpecific: { [subject: string]: number };
//   };
// }

// export interface UpdateExamData {
//   title?: string;
//   description?: string;
//   duration?: number;
//   passingScore?: number;
//   isActive?: boolean;
// }

// export async function createExam(
//   examData: CreateExamData
// ): Promise<{ success: boolean; message: string; exam?: any }> {
//   try {
//     await dbConnect();

//     // Get general questions (Math and English)
//     const mathQuestions = await Question.find({
//       department: "General",
//       subject: "Mathematics",
//     }).limit(examData.questionFilters.general.math);

//     const englishQuestions = await Question.find({
//       department: "General",
//       subject: "English Language",
//     }).limit(examData.questionFilters.general.english);

//     // Get department-specific questions
//     const departmentQuestions = [];
//     for (const [subject, count] of Object.entries(
//       examData.questionFilters.departmentSpecific
//     )) {
//       const questions = await Question.find({
//         department: examData.department,
//         subject: subject,
//       }).limit(count);
//       departmentQuestions.push(...questions);
//     }

//     // Combine all questions
//     const allQuestions = [
//       ...mathQuestions,
//       ...englishQuestions,
//       ...departmentQuestions,
//     ];

//     if (allQuestions.length === 0) {
//       return {
//         success: false,
//         message: "No questions available for this configuration",
//       };
//     }

//     const exam = new Exam({
//       title: examData.title,
//       description: examData.description,
//       duration: examData.duration,
//       department: examData.department,
//       questions: allQuestions.map((q) => q._id),
//       totalQuestions: allQuestions.length,
//       passingScore: examData.passingScore || 50,
//       createdBy: new mongoose.Types.ObjectId(examData.createdBy),
//     });

//     await exam.save();

//     return {
//       success: true,
//       message: "Exam created successfully",
//       exam: exam.toObject(),
//     };
//   } catch (error: unknown) {
//     return {
//       success: false,
//       message:"Failed to create exam",
//     };
//   }
// }

// export async function getExamsByDepartment(
//   department: string
// ): Promise<IExam[]> {
//   try {
//     await dbConnect();
//     return await Exam.find({ department, isActive: true })
//       .populate("createdBy", "name")
//       .sort({ createdAt: -1 });
//   } catch (error) {
//     return [];
//   }
// }

// export async function getExamById(examId: string): Promise<IExam | null> {
//   try {
//     await dbConnect();
//     return await Exam.findById(examId)
//       .populate("questions")
//       .populate("createdBy", "name");
//   } catch (error) {
//     return null;
//   }
// }

// export async function getExamWithQuestions(
//   examId: string,
//   userDepartment: string
// ): Promise<{ exam: IExam; questions: IQuestion[] } | null> {
//   try {
//     await dbConnect();

//     const exam = await Exam.findById(examId);
//     if (!exam || !exam.isActive || exam.department !== userDepartment) {
//       return null;
//     }

//     const questions = await Question.find({
//       _id: { $in: exam.questions },
//     }).select("-correctOption"); // Hide correct answers from students

//     return { exam, questions };
//   } catch (error) {
//     return null;
//   }
// }

// export async function getAllExams(): Promise<IExam[]> {
//   try {
//     await dbConnect();
//     return await Exam.find({})
//       .populate("createdBy", "name")
//       .sort({ createdAt: -1 });
//   } catch (error) {
//     return [];
//   }
// }

// export async function updateExam(
//   examId: string,
//   updateData: UpdateExamData
// ): Promise<{ success: boolean; message: string }> {
//   try {
//     await dbConnect();

//     const exam = await Exam.findByIdAndUpdate(examId, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!exam) {
//       return { success: false, message: "Exam not found" };
//     }

//     return { success: true, message: "Exam updated successfully" };
//   } catch (error: unknown) {
//     return {
//       success: false,
//       message:"Failed to update exam",
//     };
//   }
// }

// export async function deleteExam(
//   examId: string
// ): Promise<{ success: boolean; message: string }> {
//   try {
//     await dbConnect();

//     const exam = await Exam.findByIdAndDelete(examId);

//     if (!exam) {
//       return { success: false, message: "Exam not found" };
//     }

//     return { success: true, message: "Exam deleted successfully" };
//   } catch (error: unknown) {
//     return {
//       success: false,
//       message: "Failed to delete exam",
//     };
//   }
// }

// export async function toggleExamStatus(
//   examId: string
// ): Promise<{ success: boolean; message: string }> {
//   try {
//     await dbConnect();

//     const exam = await Exam.findById(examId);
//     if (!exam) {
//       return { success: false, message: "Exam not found" };
//     }

//     exam.isActive = !exam.isActive;
//     await exam.save();

//     return {
//       success: true,
//       message: `Exam ${
//         exam.isActive ? "activated" : "deactivated"
//       } successfully`,
//     };
//   } catch (error: unknown) {
//     return {
//       success: false,
//       message:"Failed to toggle exam status",
//     };
//   }
// }
