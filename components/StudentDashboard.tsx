// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "./Button";
// import Link from "next/link";
// import { logout } from "@/lib/user-action";

// interface Exam {
//   _id: string;
//   title: string;
//   description?: string;
//   duration: number;
//   totalQuestions: number;
//   department: string;
//   createdAt: string;
// }

// interface UserResult {
//   _id: string;
//   examId: {
//     _id: string;
//     title: string;
//   } | null;
//   percentage: number;
//   submittedAt: string;
// }

// interface StudentDashboardProps {
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     role: string;
//     department?: string;
//   };
// }

// const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
//   const router = useRouter();
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [results, setResults] = useState<UserResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeExam, setActiveExam] = useState<Exam | null>(null);

//   const openInstructionModal = (exam: Exam) => {
//     setActiveExam(exam);
//   };

//   const closeModal = () => {
//     setActiveExam(null);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user.department) return;
//       try {
//         const examsResponse = await fetch(
//           `/api/exams?department=${user.department}`
//         );
//         const examsData = await examsResponse.json();
//         const resultsResponse = await fetch("/api/results/user");
//         const resultsData = await resultsResponse.json();

//         setExams(examsData.exams || []);
//         setResults(resultsData.results || []);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [user.department]);

//   const handleStartExam = (examId: string) =>
//     router.push(`/examInterface/${examId}`);

//   const hasAttempted = (examId: string) =>
//     results.some((result) => result.examId?._id === examId);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-8">
//       {/* Top Bar */}
//       <header className="flex flex-col md:flex-row items-center justify-between mb-10 bg-white rounded-xl shadow-md p-4 md:p-6">
//         <div>
//           <h1 className="text-3xl font-bold text-blue-700">
//             Student Dashboard
//           </h1>
//           <p className="text-gray-500">
//             Welcome back, <span className="font-semibold">{user.name}!</span> 👋
//           </p>
//         </div>

//         <div className="flex gap-3 mt-4 md:mt-0">
//           <Link
//             href="/profile"
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
//           >
//             Profile
//           </Link>

//           {/* <Button onClick={logout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">Logout</Button> */}
//         </div>
//       </header>

//       {/* Stats Section */}
//       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
//         <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
//           <h3 className="text-gray-500 font-medium">Available Exams</h3>
//           <p className="text-4xl font-bold text-blue-600 mt-2">
//             {exams.length}
//           </p>
//         </div>
//         <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
//           <h3 className="text-gray-500 font-medium">Completed</h3>
//           <p className="text-4xl font-bold text-green-600 mt-2">
//             {results.length}
//           </p>
//         </div>
//         <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
//           <h3 className="text-gray-500 font-medium">Average Score</h3>
//           <p className="text-4xl font-bold text-yellow-500 mt-2">
//             {results.length > 0
//               ? Math.round(
//                   results.reduce((sum, r) => sum + r.percentage, 0) /
//                     results.length
//                 )
//               : 0}
//             %
//           </p>
//         </div>
//       </section>

//       {/* Exams List */}
//       <section className="bg-white rounded-xl shadow-md p-6 mb-10">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
//           Available Exams
//         </h2>
//         {exams.length === 0 ? (
//           <p className="text-gray-500 text-center py-8">
//             No exams available right now.
//           </p>
//         ) : (
//           <div className="grid gap-6">
//             {exams.map((exam) => (
//               <div
//                 key={exam._id}
//                 className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition bg-gradient-to-r from-blue-50 to-white"
//               >
//                 <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
//                   <div>
//                     <h3 className="text-xl font-semibold text-gray-900 mb-1">
//                       {exam.title}
//                     </h3>
//                     {exam.description && (
//                       <p className="text-gray-600 text-sm mb-2">
//                         {exam.description}
//                       </p>
//                     )}
//                     <p className="text-xs text-gray-500">
//                       {exam.duration} min • {exam.totalQuestions} questions
//                     </p>
//                   </div>
//                   <div>
//                     {hasAttempted(exam._id) ? (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() =>
//                           router.push(
//                             `/student/results/${
//                               results.find((r) => r.examId?._id === exam._id)
//                                 ?._id
//                             }`
//                           )
//                         }
//                       >
//                         View Result
//                       </Button>
//                     ) : (
//                       <Button
//                         onClick={() => openInstructionModal(exam)}
//                         className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
//                       >
//                         Start Exam
//                       </Button>
//                     )}

//                     {activeExam && (
//                       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
//                           <h2 className="text-xl font-bold text-gray-800 mb-3">
//                             Exam Instructions
//                           </h2>

//                           <p className="text-gray-600 text-sm leading-relaxed mb-4">
//                             Please read the following instructions carefully
//                             before starting the exam:
//                             <br />
//                             <br />
//                             • You cannot pause or restart the exam once started.
//                             <br />
//                             • Each question must be answered before you move to
//                             the next one.
//                             <br />
//                             • Your time begins the moment you click <b>Start Exam.</b>
//                             <br />
//                             • Closing the browser may auto-submit your answers.
//                             <br />
//                             • Do not refresh the page during the exam.
//                             <br />
//                           </p>

//                           <div className="flex justify-end gap-3 mt-6">
//                             <Button variant="outline" onClick={closeModal}>
//                               Cancel
//                             </Button>

//                             <Button
//                               className="bg-blue-600 text-white"
//                               onClick={() => {
//                                 closeModal();
//                                 router.push(`/examInterface/${activeExam._id}`);
//                               }}
//                             >
//                               Start Exam
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Recent Results */}
//       {results.length > 0 && (
//         <section className="bg-white rounded-xl shadow-md p-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
//             Recent Results
//           </h2>
//           <div className="divide-y divide-gray-200">
//             {results.slice(0, 5).map((result) => (
//               <div
//                 key={result._id}
//                 className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4"
//               >
//                 <div>
//                   <h3 className="font-semibold text-gray-800">
//                     {result.examId?.title || "Exam Deleted"}
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     {new Date(result.submittedAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <span
//                   className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${
//                     result.percentage >= 50
//                       ? "bg-green-100 text-green-700"
//                       : "bg-red-100 text-red-700"
//                   }`}
//                 >
//                   {Math.round(result.percentage)}%
//                 </span>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// };

// export default StudentDashboard;



"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import Link from "next/link";
import { logout } from "@/lib/user-action";
import { BookOpen, CheckCircle, TrendingUp, Clock, FileText, X, AlertTriangle, User, LogOut, XCircle } from "lucide-react"; // 👈 Added Lucide Icons

// ... (Interface definitions remain the same)
interface Exam {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  totalQuestions: number;
  department: string;
  createdAt: string;
}

interface UserResult {
  _id: string;
  examId: {
    _id: string;
    title: string;
  } | null;
  percentage: number;
  submittedAt: string;
}

interface StudentDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  const openInstructionModal = (exam: Exam) => {
    setActiveExam(exam);
  };

  const closeModal = () => {
    setActiveExam(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user.department) {
        setLoading(false);
        return;
      }
      try {
        // Fetch all exams for the user's department
        const examsResponse = await fetch(
          `/api/exams?department=${user.department}`
        );
        const examsData = await examsResponse.json();
        
        // Fetch the user's results
        const resultsResponse = await fetch("/api/results/user");
        const resultsData = await resultsResponse.json();

        setExams(examsData.exams || []);
        setResults(resultsData.results || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.department]);

  const hasAttempted = (examId: string) =>
    results.some((result) => result.examId?._id === examId);
    
  // Calculate average percentage
  const averageScore = results.length > 0
    ? Math.round(
        results.reduce((sum, r) => sum + r.percentage, 0) /
        results.length
      )
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    // 🎨 Main Background
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* 🔝 Top Bar (Header) */}
      <header className="sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between mb-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-t-4 border-blue-600 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">
            CBT Student Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-semibold text-blue-600">{user.name}!</span> 👋
          </p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href="/profile"
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-md"
          >
            <User size={16} /> Profile
          </Link>
          <Button 
            onClick={logout} 
            className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition shadow-md"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </header>

      {/* 📊 Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="Available Exams" value={exams.length} icon={<BookOpen className="w-6 h-6 text-blue-600" />} color="text-blue-600" />
        <StatCard title="Completed Exams" value={results.length} icon={<CheckCircle className="w-6 h-6 text-green-600" />} color="text-green-600" />
        <StatCard title="Average Score" value={`${averageScore}%`} icon={<TrendingUp className="w-6 h-6 text-yellow-600" />} color="text-yellow-600" />
      </section>

      {/* 📝 Exams List */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-100 pb-2">
          Exams for {user.department}
        </h2>
        {exams.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              No exams currently available for your department.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => {
              const attempted = hasAttempted(exam._id);
              return (
                <div
                  key={exam._id}
                  // 🎨 Card Styling: Blue-tinted border/shadow for visual hierarchy
                  className={`border-l-4 rounded-xl p-5 transition-all duration-300 
                    ${attempted 
                        ? 'border-green-500 bg-green-50/50 hover:bg-green-100' 
                        : 'border-blue-500 bg-blue-50/50 hover:bg-blue-100'
                    }
                    shadow-sm hover:shadow-md
                  `}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-700" />
                        {exam.title}
                      </h3>
                      {exam.description && (
                        <p className="text-gray-600 text-sm mb-2 max-w-xl">
                          {exam.description}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-600 font-medium space-x-3 mt-1">
                        <span className="flex items-center gap-1"><Clock size={14} /> {exam.duration} min</span>
                        <span className="flex items-center gap-1"><BookOpen size={14} /> {exam.totalQuestions} Questions</span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {attempted ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/student/results/${
                                results.find((r) => r.examId?._id === exam._id)?._id
                              }`
                            )
                          }
                          className="text-green-600 border-green-500 hover:bg-green-100"
                        >
                          View Result
                        </Button>
                      ) : (
                        <Button
                          onClick={() => openInstructionModal(exam)}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                        >
                          Start Exam
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 📈 Recent Results */}
      {results.length > 0 && (
        <section className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-100 pb-2">
            Recent Results
          </h2>
          <div className="divide-y divide-gray-200">
            {results.slice(0, 5).map((result) => {
                const passed = result.percentage >= 50;
                const scoreColor = passed ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100";
                return (
                    <div
                        key={result._id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 hover:bg-gray-50 transition duration-150 rounded-md px-2 -mx-2"
                    >
                        <div className="flex items-center gap-3">
                            {passed ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                            <div>
                                <h3 className="font-semibold text-gray-800">
                                    {result.examId?.title || "Exam Deleted"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Taken on: {new Date(result.submittedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <span
                            className={`mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-lg font-bold ${scoreColor}`}
                        >
                            {Math.round(result.percentage)}%
                        </span>
                    </div>
                );
            })}
          </div>
        </section>
      )}

      {/* ⚠️ Exam Instruction Modal (Enhanced Design) */}
      {activeExam && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative border-t-8 border-blue-600 animate-slide-in-up">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              aria-label="Close instructions"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-500" /> Exam Instructions
            </h2>

            <p className="text-gray-700 text-md leading-relaxed mb-6 border-b pb-4">
              You are about to start the **{activeExam.title}** exam. Please review the rules carefully.
            </p>

            <ul className="text-gray-600 text-sm space-y-3 pl-5 list-disc mb-6">
                <li><span className="font-semibold">Duration:</span> {activeExam.duration} minutes.</li>
                <li><span className="font-semibold">Questions:</span> {activeExam.totalQuestions} items.</li>
                <li><span className="font-semibold text-red-600">ATTENTION:</span> You cannot pause or restart the exam once started.</li>
                <li>Each question must be answered sequentially before moving to the next.</li>
                <li>Your time begins the moment you click **Start Exam**.</li>
                <li>Closing the browser or refreshing the page may auto-submit your answers.</li>
            </ul>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={closeModal}
                className="text-gray-600 hover:bg-gray-100 border-gray-300"
              >
                Cancel
              </Button>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/40"
                onClick={() => {
                  closeModal();
                  router.push(`/examInterface/${activeExam._id}`);
                }}
              >
                Start Exam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for Stat Cards
const StatCard = ({ title, value, icon, color }:
    { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4 border-l-4 border-blue-400 transition hover:shadow-xl hover:scale-[1.02]">
        <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('-600', '-100')} flex-shrink-0`}>
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
            <p className={`text-3xl font-bold ${color} mt-1`}>
                {value}
            </p>
        </div>
    </div>
);

export default StudentDashboard;