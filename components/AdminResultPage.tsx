// // components/admin/AdminResultsPage.tsx
// "use client";
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "../components/Button";
// // import {Button} from "./Button";

// interface AdminResultData {
//   _id: string;
//   score: number;
//   percentage: number;
//   timeSpent: number;
//   submittedAt: string;
//   autoSubmitted: boolean;
//   userId: {
//     _id: string;
//     name: string;
//     email: string;
//     department: string;
//   };
//   examId: {
//     _id: string;
//     title: string;
//     department: string;
//     passingScore: number;
//     totalQuestions: number;
//   };
// }

// interface AdminResultsPageProps {
//   examId: string;
// }

// export const AdminResultsPage: React.FC<AdminResultsPageProps> = ({ examId }) => {
//   const router = useRouter();
//   const [results, setResults] = useState<AdminResultData[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchResults();
//   }, [examId]);

//   const fetchResults = async () => {
//     try {
//       const response = await fetch(`/api/results`);
//       const data = await response.json();

//       if (data.success) {
//         setResults(data.results);
//       } else {
//         alert("Could not load results.");
//         router.push("/admin/adminDashboard");
//       }
//     } catch (error) {
//       console.error("Error fetching results:", error);
//       router.push("/admin/adminDashboard");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
//           <p className="text-gray-600">Overview of all students who took this exam</p>
//         </div>
//         <Button onClick={() => router.push("/admin/adminDashboard")}>Back</Button>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//         <table className="min-w-full text-left">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Student</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Email</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Department</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Score</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Percentage</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Time Spent</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Submitted</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Status</th>
//               <th className="px-6 py-3"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {results.map((res) => {
//               const passed = res.percentage >= res.examId.passingScore;
//               return (
//                 <tr key={res._id} className="border-t">
//                   <td className="px-6 py-4">{res.userId.name}</td>
//                   <td className="px-6 py-4">{res.userId.email}</td>
//                   <td className="px-6 py-4">{res.userId.department}</td>
//                   <td className="px-6 py-4">
//                     {res.score}/{res.examId.totalQuestions}
//                   </td>
//                   <td className="px-6 py-4">{Math.round(res.percentage)}%</td>
//                   <td className="px-6 py-4">
//                     {Math.floor(res.timeSpent / 60)}:
//                     {(res.timeSpent % 60).toString().padStart(2, "0")}
//                   </td>
//                   <td className="px-6 py-4">
//                     {new Date(res.submittedAt).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         passed
//                           ? "bg-green-100 text-green-800"
//                           : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {passed ? "PASSED" : "FAILED"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <Button
//                       variant="outline"
//                       onClick={() => router.push(`/admin/results/${res._id}`)}
//                     >
//                       View
//                     </Button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };













// // components/admin/AdminResultsPage.tsx
// "use client";
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "../components/Button";

// interface AdminResultData {
//   _id: string;
//   score: number;
//   percentage: number;
//   timeSpent: number;
//   submittedAt: string;
//   autoSubmitted: boolean;
//   userId: {
//     _id: string;
//     name: string;
//     email: string;
//     department: string;
//   };
//   examId: {
//     _id: string;
//     title: string;
//     department: string;
//     passingScore: number;
//     totalQuestions: number;
//   };
// }

// interface AdminResultsPageProps {
//   examId?: string; // Make optional in case you want to view all results
// }

// export const AdminResultsPage: React.FC<AdminResultsPageProps> = ({ examId }) => {
//   const router = useRouter();
//   const [results, setResults] = useState<AdminResultData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     console.log("AdminResultsPage mounted with examId:", examId);
//     fetchResults();
//   }, [examId]);

//   const fetchResults = async () => {
//     try {
//       setError(null);
//       // If examId is provided, filter by it; otherwise get all results
//       const url = examId 
//         ? `/api/results?examId=${examId}` 
//         : `/api/results`;
      
//       console.log("Fetching from URL:", url);
      
//       const response = await fetch(url);
      
//       console.log("Response status:", response.status);
//       console.log("Response ok:", response.ok);
      
//       const data = await response.json();
      
//       console.log("API Response:", data);
//       console.log("Results count:", data.results?.length);

//       if (data.success) {
//         console.log("Setting results:", data.results);
//         setResults(data.results || []);
//       } else {
//         const errorMsg = `Could not load results: ${data.message}`;
//         console.error(errorMsg);
//         setError(errorMsg);
//       }
//     } catch (error) {
//       console.error("Error fetching results:", error);
//       const errorMsg = `Error loading results: ${error instanceof Error ? error.message : 'Unknown error'}`;
//       setError(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Results</h1>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <div className="space-x-4">
//             <Button onClick={fetchResults}>Retry</Button>
//             <Button variant="outline" onClick={() => router.push("/admin/adminDashboard")}>
//               Back to Dashboard
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (results.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Results</h1>
//           <p className="text-gray-600 mb-4">No results found for this exam</p>
//           <p className="text-sm text-gray-500 mb-4">
//             ExamId: {examId || "All Exams"}
//           </p>
//           <div className="space-x-4">
//             <Button onClick={fetchResults}>Refresh</Button>
//             <Button variant="outline" onClick={() => router.push("/admin/adminDashboard")}>
//               Back to Dashboard
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
//           <p className="text-gray-600">
//             {examId 
//               ? `Overview of all students who took this exam (${results.length} results)`
//               : `All exam results (${results.length} results)`
//             }
//           </p>
//         </div>
//         <Button onClick={() => router.push("/admin/adminDashboard")}>Back</Button>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//         <table className="min-w-full text-left">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Student</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Email</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Department</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Score</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Percentage</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Time Spent</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Submitted</th>
//               <th className="px-6 py-3 text-sm font-medium text-gray-700">Status</th>
//               <th className="px-6 py-3"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {results.map((res) => {
//               const passed = res.percentage >= res.examId.passingScore;
//               return (
//                 <tr key={res._id} className="border-t">
//                   <td className="px-6 py-4">{res.userId.name}</td>
//                   <td className="px-6 py-4">{res.userId.email}</td>
//                   <td className="px-6 py-4">{res.userId.department}</td>
//                   <td className="px-6 py-4">
//                     {res.score}/{res.examId.totalQuestions}
//                   </td>
//                   <td className="px-6 py-4">{Math.round(res.percentage)}%</td>
//                   <td className="px-6 py-4">
//                     {Math.floor(res.timeSpent / 60)}:
//                     {(res.timeSpent % 60).toString().padStart(2, "0")}
//                   </td>
//                   <td className="px-6 py-4">
//                     {new Date(res.submittedAt).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         passed
//                           ? "bg-green-100 text-green-800"
//                           : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {passed ? "PASSED" : "FAILED"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <Button
//                       variant="outline"
//                       onClick={() => router.push(`/admin/results/${res._id}`)}
//                     >
//                       View
//                     </Button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };






//USED AI FOR THIS DESIGN PART TOO, THE ABOVE IS MY ORIGINAL AND IT ALSO WORKS FINE
// components/admin/AdminResultsPage.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/Button"; // Assuming this is your custom Button component
import { Clock, TrendingUp, User, BookOpen, CheckCircle, XCircle, ChevronRight, Loader2 } from "lucide-react"; // Import new icons

// ... (Interface definitions remain the same)
interface AdminResultData {
  _id: string;
  score: number;
  percentage: number;
  timeSpent: number;
  submittedAt: string;
  autoSubmitted: boolean;
  userId: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  examId: {
    _id: string;
    title: string;
    department: string;
    passingScore: number;
    totalQuestions: number;
  };
}

interface AdminResultsPageProps {
  examId?: string; // Make optional in case you want to view all results
}

const formatTimeSpent = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}m ${remainingSeconds}s`;
};

// --- Start of Component ---

export const AdminResultsPage: React.FC<AdminResultsPageProps> = ({ examId }) => {
  const router = useRouter();
  const [results, setResults] = useState<AdminResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    // Reset states
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const url = examId 
        ? `/api/results?examId=${examId}` 
        : `/api/results`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results || []);
      } else {
        setError(`Could not load results: ${data.message || 'Unknown server error'}`);
      }
    } catch (error) {
      setError(`Error loading results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-300 rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Error Loading Results</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={fetchResults} className="bg-red-600 hover:bg-red-700">
                Retry
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/adminDashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- No Results State ---
  if (results.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Exam Results</h1>
          <p className="text-blue-600 mb-4">No results found for this exam.</p>
          <p className="text-sm text-gray-500 mb-4">
            ExamId: **{examId || "All Exams"}**
          </p>
          <div className="space-x-4">
            <Button onClick={fetchResults}>Refresh</Button>
            <Button variant="outline" onClick={() => router.push("/admin/adminDashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Content ---
  // const examTitle = examId ? results[0].examId.title : 'All Exams';
const examTitle = examId 
  ? results[0]?.examId?.title || "Unknown Exam" 
  : "All Exams";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header (Enhanced Design) */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border-t-4 border-blue-600 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 mb-1">
            {examId ? 'Exam Results for' : 'Overall Results Dashboard'}
          </h1>
          <p className="text-xl font-semibold text-gray-700 mb-3 sm:mb-0">
            {examTitle}
          </p>
          <p className="text-sm text-gray-500">
            Displaying **{results.length}** results.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/admin/adminDashboard")} 
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 transition duration-200"
        >
          Back to Dashboard
        </Button>
      </div>

      {/* --- RESPONSIVE CONTENT BLOCK ---
        This div controls the switching between Card (Mobile) and Table (Laptop) views
      */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        
        {/* --- 💻 DESKTOP/LAPTOP VIEW: Classic Table (md and up) --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-blue-50/70 border-b-2 border-blue-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-700">
                  <User size={14} className="inline mr-1" /> Student Info
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-700">
                  <BookOpen size={14} className="inline mr-1" /> Score
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-700">
                  <TrendingUp size={14} className="inline mr-1" /> Grade (%)
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-700">
                  <Clock size={14} className="inline mr-1" /> Time/Submit
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-700 text-center">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((res) => {
                // const passed = res.percentage >= res.examId.passingScore;
                const passed = res.examId
  ? res.percentage >= res.examId.passingScore
  : false;
                const statusColor = passed ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
                
                return (
                  <tr 
                    key={res._id} 
                    className="hover:bg-blue-50 transition duration-150 ease-in-out cursor-pointer"
                    onClick={() => router.push(`/admin/results/${res._id}`)}
                  >
                    {/* Student Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{res.userId?.name ?? "Deleted User"}</div>
                      <div className="text-xs text-gray-500">{res.userId?.email ?? "Deleted user email"}</div>
                      <div className="text-xs text-blue-500 font-medium mt-1">{res.userId?.department ?? "Deleted dept"}</div>
                    </td>
                    
                    {/* Score */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {res.score} / {res.examId?.totalQuestions ?? "deleted"}
                    </td>

                    {/* Percentage */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {Math.round(res.percentage)}%
                    </td>

                    {/* Time/Submit */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-700">{formatTimeSpent(res.timeSpent)}</div>
                        <div className="text-xs">{new Date(res.submittedAt).toLocaleDateString()}</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                        {passed ? "PASSED" : "FAILED"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight size={20} className="text-gray-400 hover:text-blue-600 transition" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --- 📱 MOBILE VIEW: Stacked Cards (sm and down) --- */}
        <div className="md:hidden p-4 space-y-4">
            {results.map((res) => {
              const passed = res.percentage >= res.examId?.passingScore;
              const statusClasses = passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50";
              const statusIcon = passed ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />;

              return (
                <div 
                  key={res._id} 
                  className={`border-l-4 ${statusClasses} rounded-lg shadow-sm p-4 space-y-2 transition-all duration-200 hover:shadow-md`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-base font-semibold text-gray-900">{res.userId?.name ?? "deleted"}</p>
                                <p className="text-xs text-blue-500">{res.userId?.department ?? "Deleted"}</p>
                            </div>
                        </div>
                        {/* Status Badge */}
                        <span className={`flex items-center space-x-1 px-3 py-1 text-xs font-bold uppercase rounded-full ${passed ? 'text-green-800 bg-green-200' : 'text-red-800 bg-red-200'}`}>
                            {statusIcon}
                            <span>{passed ? "Passed" : "Failed"}</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 border-t border-gray-200 pt-2">
                        {/* Score */}
                        <div className="flex justify-between items-center pr-2">
                            <span className="font-medium text-gray-500">Score:</span>
                            <span className="font-semibold text-blue-600">{res.score} / {res.examId?.totalQuestions ?? "deleted"}</span>
                        </div>
                        {/* Percentage */}
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-500">Grade:</span>
                            <span className="font-bold text-lg text-blue-700">{Math.round(res.percentage)}%</span>
                        </div>
                        {/* Time Spent */}
                        <div className="flex justify-between items-center pr-2">
                            <span className="font-medium text-gray-500">Time:</span>
                            <span>{formatTimeSpent(res.timeSpent)}</span>
                        </div>
                        {/* Submitted At */}
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-500">Date:</span>
                            <span>{new Date(res.submittedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="pt-2">
                        <Button 
                            variant="outline"
                            onClick={() => router.push(`/admin/results/${res._id}`)}
                            className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                            View Details <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
              );
            })}
        </div>
        
      </div>
    </div>
  );
};