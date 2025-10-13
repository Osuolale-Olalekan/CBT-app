"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { downloadResultPDF } from "@/lib/utils";
import { Button } from "./Button"; // You already have this

interface ResultData {
  _id: string;
  score: number;
  percentage: number;
  timeSpent: number;
  submittedAt: string;
  autoSubmitted: boolean;
  userId: {
    name: string;
    email: string;
    department: string;
  };
  examId: {
    title: string;
    department: string;
    passingScore: number;
    totalQuestions: number;
  } | null;
  answers: {
    questionId: {
      _id: string;
      text: string;
      options: string[];
      correctOption: number;
      subject: string;
    } | null;
    selectedOption: number;
    isCorrect: boolean;
  }[];
}

interface ResultsPageProps {
  result: ResultData;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ result }) => {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!result || !result.examId) return;
    setDownloading(true);
    try {
      const pdfData = {
        studentName: result.userId.name,
        studentEmail: result.userId.email,
        department: result.userId.department,
        examTitle: result.examId?.title ?? "Exam deleted",
        score: result.score,
        totalQuestions: result.examId?.totalQuestions ?? 0,
        percentage: result.percentage,
        timeSpent: result.timeSpent,
        submittedAt: new Date(result.submittedAt),
        passed: result.examId
          ? result.percentage >= result.examId.passingScore
          : false,
        answers: result.answers.map((answer) => ({
          question: answer.questionId?.text ?? "Question deleted",
          options: answer.questionId?.options ?? [],
          selectedOption: answer.selectedOption,
          correctOption: answer.questionId?.correctOption ?? -1,
          isCorrect: answer.isCorrect,
          subject: answer.questionId?.subject ?? "Unknown",
        })),
      };
      downloadResultPDF(pdfData);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const getSubjectBreakdown = () => {
    const breakdown: { [subject: string]: { correct: number; total: number } } =
      {};
    result.answers.forEach((answer) => {
      const subject = answer.questionId?.subject ?? "Unknown";
      if (!breakdown[subject]) breakdown[subject] = { correct: 0, total: 0 };
      breakdown[subject].total++;
      if (answer.isCorrect) breakdown[subject].correct++;
    });
    return breakdown;
  };

  const passed = result.examId
    ? result.percentage >= result.examId.passingScore
    : false;
  const subjectBreakdown = getSubjectBreakdown();

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-1">
            {result.examId?.title ?? "Exam deleted"}
          </h1>
          <p className="text-gray-500 text-sm">
            {result.userId.name} • {result.userId.email}
          </p>
        </div>

        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => router.push("/studentDashboard")}
          >
            Back to Dashboard
          </Button>
          {result.examId && (
            <Button onClick={handleDownloadPDF} loading={downloading}>
              {downloading ? "Generating..." : "Download PDF"}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Exam Summary</h2>
          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${
              passed
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {passed ? "PASSED" : "FAILED"}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-500 text-sm">Score</p>
            <p className="text-2xl font-semibold">
              {result.score}/{result.examId?.totalQuestions ?? 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Percentage</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
              <span className="text-lg font-semibold">
                {Math.round(result.percentage)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Time Spent</p>
            <p className="text-2xl font-semibold">
              {Math.round(result.timeSpent / 60)} min
            </p>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6">Subject Breakdown</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(subjectBreakdown).map(([subject, stats]) => {
            const percentage = Math.round(
              (stats.correct / stats.total) * 100
            );
            return (
              <div
                key={subject}
                className="p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="font-medium text-gray-800">{subject}</p>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>
                    {stats.correct}/{stats.total} Correct 
                  </span>
                  <span
                    className={`font-semibold ${
                      percentage >= 50 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage >= 50 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answers Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Answer Summary</h2>
        <div className="space-y-4">
          {result.answers.map((answer, idx) => (
            <div
              key={answer.questionId?._id ?? idx}
              className={`p-4 rounded-xl border ${
                answer.isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="font-medium mb-1">
                Q{idx + 1}: {answer.questionId?.text ?? "Question deleted"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Your Answer:</span>{" "}
                {answer.questionId?.options?.[answer.selectedOption] ??
                  "Unanswered"}{" "}
                —{" "}
                <span
                  className={`font-semibold ${
                    answer.isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {answer.isCorrect ? "Correct ✔️" : "Incorrect ❌"}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Correct Answer:</span>{" "}
                {answer.questionId?.options?.[
                  answer.questionId?.correctOption ?? -1
                ] ?? "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



// "use client"
// // components/student/ResultsPage.tsx
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from './Button';
// import { downloadResultPDF } from '@/lib/utils';

// interface ResultData {
//   _id: string;
//   score: number;
//   percentage: number;
//   timeSpent: number;
//   submittedAt: string;
//   autoSubmitted: boolean;
//   userId: {
//     name: string;
//     email: string;
//     department: string;
//   };
//   examId: {
//     title: string;
//     department: string;
//     passingScore: number;
//     totalQuestions: number;
//   };
//   answers: {
//     questionId: {
//       _id: string;
//       text: string;
//       options: string[];
//       correctOption: number;
//       subject: string;
//     };
//     selectedOption: number;
//     isCorrect: boolean;
//   }[];
// }

// interface ResultsPageProps {
//   resultId: string;
// }

// export const ResultsPage: React.FC<ResultsPageProps> = ({ resultId }) => {
//   const router = useRouter();
//   const [result, setResult] = useState<ResultData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [downloading, setDownloading] = useState(false);

//   useEffect(() => {
//     fetchResult();
//   }, [resultId]);

//   const fetchResult = async () => {
//     try {
//       const response = await fetch(`/api/results/${resultId}`);
//       const data = await response.json();

//       if (data.success) {
//         setResult(data.result);
//       } else {
//         router.push('/studentDashboard');
//       }
//     } catch (error) {
//       console.error('Error fetching result:', error);
//       router.push('/studentDashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadPDF = async () => {
//     if (!result) return;

//     setDownloading(true);

//     try {
//       const pdfData = {
//         studentName: result.userId.name,
//         studentEmail: result.userId.email,
//         department: result.userId.department,
//         examTitle: result.examId.title,
//         score: result.score,
//         totalQuestions: result.examId.totalQuestions,
//         percentage: result.percentage,
//         timeSpent: result.timeSpent,
//         submittedAt: new Date(result.submittedAt),
//         passed: result.percentage >= result.examId.passingScore,
//         answers: result.answers.map(answer => ({
//           question: answer.questionId.text,
//           options: answer.questionId.options,
//           selectedOption: answer.selectedOption,
//           correctOption: answer.questionId.correctOption,
//           isCorrect: answer.isCorrect,
//           subject: answer.questionId.subject
//         }))
//       };

//       downloadResultPDF(pdfData);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       alert('Error generating PDF. Please try again.');
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const getSubjectBreakdown = () => {
//     if (!result) return {};

//     const breakdown: { [subject: string]: { correct: number; total: number } } = {};

//     result.answers.forEach(answer => {
//       const subject = answer.questionId.subject;
//       if (!breakdown[subject]) {
//         breakdown[subject] = { correct: 0, total: 0 };
//       }
//       breakdown[subject].total++;
//       if (answer.isCorrect) {
//         breakdown[subject].correct++;
//       }
//     });

//     return breakdown;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!result) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-500 text-lg">Result not found.</p>
//       </div>
//     );
//   }

//   const subjectBreakdown = getSubjectBreakdown();
//   const passed = result.percentage >= result.examId.passingScore;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.examId.title}</h1>
//             <p className="text-gray-600">Exam Results for {result.userId.name}</p>
//           </div>
//           <div className="flex space-x-4">
//             <Button
//               variant="outline"
//               onClick={() => router.push('/studentDashboard')}
//             >
//               Back to Dashboard
//             </Button>
//             <Button
//               onClick={handleDownloadPDF}
//               loading={downloading}
//             >
//               Download PDF
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Results Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="text-center">
//             <div className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
//               {result.percentage}%
//             </div>
//             <p className="text-gray-600">Final Score</p>
//             <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
//               passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//             }`}>
//               {passed ? 'PASSED' : 'FAILED'}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="text-center">
//             <div className="text-3xl font-bold text-blue-600 mb-2">
//               {result.score}/{result.examId.totalQuestions}
//             </div>
//             <p className="text-gray-600">Questions Correct</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="text-center">
//             <div className="text-3xl font-bold text-purple-600 mb-2">
//               {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
//             </div>
//             <p className="text-gray-600">Time Spent</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="text-center">
//             <div className="text-lg font-bold text-gray-900 mb-2">
//               {new Date(result.submittedAt).toLocaleDateString()}
//             </div>
//             <p className="text-gray-600">Submission Date</p>
//             {result.autoSubmitted && (
//               <div className="mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
//                 Auto-submitted
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Subject Breakdown */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">Subject Breakdown</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {Object.entries(subjectBreakdown).map(([subject, stats]) => (
//             <div key={subject} className="p-4 border border-gray-200 rounded-lg">
//               <h3 className="font-semibold text-gray-900 mb-2">{subject}</h3>
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm text-gray-600">Score</span>
//                 <span className="font-medium">{stats.correct}/{stats.total}</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-blue-600 h-2 rounded-full"
//                   style={{ width: `${(stats.correct / stats.total) * 100}%` }}
//                 ></div>
//               </div>
//               <div className="text-right text-sm text-gray-500 mt-1">
//                 {Math.round((stats.correct / stats.total) * 100)}%
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Detailed Results */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">Question by Question Review</h2>
//         <div className="space-y-6">
//           {result.answers.map((answer, index) => (
//             <div key={answer.questionId._id} className="border border-gray-200 rounded-lg p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center space-x-4">
//                   <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
//                     Q{index + 1}
//                   </span>
//                   <span className="text-sm text-gray-500">{answer.questionId.subject}</span>
//                 </div>
//                 <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//                   answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                 }`}>
//                   {answer.isCorrect ? 'Correct' : 'Incorrect'}
//                 </div>
//               </div>

//               <p className="text-gray-900 font-medium mb-4">{answer.questionId.text}</p>

//               <div className="space-y-2">
//                 {answer.questionId.options.map((option, optionIndex) => (
//                   <div
//                     key={optionIndex}
//                     className={`p-3 rounded-lg border ${
//                       optionIndex === answer.questionId.correctOption
//                         ? 'border-green-300 bg-green-50'
//                         : optionIndex === answer.selectedOption && !answer.isCorrect
//                         ? 'border-red-300 bg-red-50'
//                         : 'border-gray-200 bg-gray-50'
//                     }`}
//                   >
//                     <div className="flex items-center">
//                       <span className="font-medium mr-3">
//                         {String.fromCharCode(65 + optionIndex)}.
//                       </span>
//                       <span>{option}</span>
//                       {optionIndex === answer.questionId.correctOption && (
//                         <span className="ml-auto text-green-600 text-sm font-medium">✓ Correct Answer</span>
//                       )}
//                       {optionIndex === answer.selectedOption && optionIndex !== answer.questionId.correctOption && (
//                         <span className="ml-auto text-red-600 text-sm font-medium">✗ Your Answer</span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
