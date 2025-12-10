// components/admin/adminDashboard.tsx
"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// 引入 Lucide Icons for a clean, modern look
import { 
    Users, 
    BookOpen, 
    ClipboardList, 
    CheckSquare, 
    TrendingUp, 
    Target,
    BarChart3,
    CalendarCheck,
    HelpCircle,
    UserCircle,
    LogOut
} from "lucide-react"; 

// Interface definitions remain the same
interface DashboardStats {
    totalStudents: number;
    totalExams: number;
    totalQuestions: number;
    totalResults: number;
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

// Dummy Exam ID for the results link (as in original code)
const examId = "68e14d1e2587cfbcb842db26";

export const AdminDashboard: React.FC = () => {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/admin/stats");
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 🔝 Top Navigation Bar (Simplified) */}
            <header className="sticky top-0 z-10 bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
                <h1 className="text-2xl font-bold text-blue-700">Admin Panel</h1>
                <div className="flex gap-3">
                    <Link
                        href="/profile"
                        className="p-2 text-gray-600 hover:text-blue-600 rounded-full transition"
                        aria-label="Profile"
                    >
                        <UserCircle className="w-6 h-6" />
                    </Link>
                    {/* Placeholder for Logout action - assuming it's available via an action/hook */}
                    <button
                        onClick={() => console.log("Logging out...")} // Replace with actual logout function
                        className="p-2 text-gray-600 hover:text-red-600 rounded-full transition"
                        aria-label="Logout"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                
                {/* 🎯 Main Header - Banner Style */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 text-white mb-10">
                    <h2 className="text-4xl font-extrabold mb-1 tracking-tight">CBT Platform Dashboard</h2>
                    <p className="text-blue-100 font-light">
                        Comprehensive overview of students, exams, and performance metrics.
                    </p>
                </div>

                {/* 🚀 Quick Actions */}
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <QuickActionButton 
                        title="Manage Users" 
                        icon={<Users className="w-7 h-7" />} 
                        bgColor="bg-blue-600"
                        link="/admin/users"
                        router={router}
                    />
                    <QuickActionButton 
                        title="Manage Questions" 
                        icon={<HelpCircle className="w-7 h-7" />} 
                        bgColor="bg-green-600"
                        link="/admin/questions"
                        router={router}
                    />
                    <QuickActionButton 
                        title="Manage Exams" 
                        icon={<ClipboardList className="w-7 h-7" />} 
                        bgColor="bg-purple-600"
                        link="/admin/createExam"
                        router={router}
                    />
                    <QuickActionButton 
                        title="View Results" 
                        icon={<BarChart3 className="w-7 h-7" />} 
                        bgColor="bg-yellow-600"
                        link={`/admin/adminResult/${examId}`}
                        router={router}
                    />
                </div>
                
                {/* 📊 Global Stats Overview */}
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">System Statistics</h3>
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard 
                            title="Total Students" 
                            value={stats.totalStudents.toLocaleString()} 
                            icon={<Users />} 
                            iconColor="text-blue-600" 
                            ringColor="border-blue-300" 
                        />
                        <StatCard 
                            title="Total Exams" 
                            value={stats.totalExams.toLocaleString()} 
                            icon={<BookOpen />} 
                            iconColor="text-green-600" 
                            ringColor="border-green-300" 
                        />
                        <StatCard 
                            title="Total Questions" 
                            value={stats.totalQuestions.toLocaleString()} 
                            icon={<CheckSquare />} 
                            iconColor="text-purple-600" 
                            ringColor="border-purple-300" 
                        />
                        <StatCard 
                            title="Total Attempts" 
                            value={stats.totalResults.toLocaleString()} 
                            icon={<CalendarCheck />} 
                            iconColor="text-yellow-600" 
                            ringColor="border-yellow-300" 
                        />
                    </div>
                )}

                {/* 📈 Performance Metrics & Department Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Overall Performance */}
                    {stats && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" /> Overall Performance
                            </h2>
                            <div className="space-y-5">
                                <PerformanceMetric 
                                    label="Average Score" 
                                    value={`${stats.averageScore}%`} 
                                    color="text-indigo-600"
                                />
                                <PerformanceMetric 
                                    label="Passing Rate" 
                                    value={`${stats.passingRate}%`} 
                                    color="text-green-600"
                                />
                                <PerformanceMetric 
                                    label="Unattempted Exams" 
                                    value={stats.totalExams - (Object.keys(stats.departmentStats).length)} // Simple proxy calculation
                                    color="text-gray-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Department Performance */}
                    {stats && (
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-yellow-600" /> Department Breakdown
                            </h2>
                            <div className="overflow-x-auto">
                                <DepartmentTable departmentStats={stats.departmentStats} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

interface QuickActionButtonProps {
    title: string;
    icon: React.ReactNode;
    bgColor: string;
    link: string;
    router: ReturnType<typeof useRouter>;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ title, icon, bgColor, link, router }) => (
    <button
        onClick={() => router.push(link)}
        className="group bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center border-t-4 border-transparent hover:border-blue-500"
    >
        <div className={`w-14 h-14 ${bgColor} text-white rounded-full flex items-center justify-center mx-auto mb-3 transition group-hover:scale-105 shadow-md`}>
            {icon}
        </div>
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">Go to {title.toLowerCase()}</p>
    </button>
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<{ className?: string }>;
  iconColor: string;
  ringColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  ringColor,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-gray-100 hover:shadow-lg transition hover:border-blue-500 flex items-center">
    <div
      className={`p-3 rounded-full ${iconColor.replace("text", "bg").replace("-600", "-100")} ${iconColor} flex-shrink-0 mr-4 border-4 ${ringColor}`}
    >
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </div>

    <div>
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <p className={`text-3xl font-extrabold ${iconColor} mt-1`}>{value}</p>
    </div>
  </div>
);

interface PerformanceMetricProps {
    label: string;
    value: string | number;
    color: string;
}

const PerformanceMetric: React.FC<PerformanceMetricProps> = ({ label, value, color }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
);

interface DepartmentTableProps {
    departmentStats: DashboardStats['departmentStats'];
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({ departmentStats }) => (
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                    Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    Pass Rate
                </th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(departmentStats).map(([dept, stats]) => (
                <tr key={dept} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.totalStudents}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{stats.averageScore}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stats.passingRate >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {stats.passingRate}%
                        </span>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);




// // components/admin/adminDashboard.tsx
// "use client"
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// interface DashboardStats {
//   totalStudents: number;
//   totalExams: number;
//   totalQuestions: number;
//   totalResults: number;
//   averageScore: number;
//   passingRate: number;
//   departmentStats: {
//     [department: string]: {
//       totalStudents: number;
//       averageScore: number;
//       passingRate: number;
//     };
//   };
// }

// const examId = "68e14d1e2587cfbcb842db26"

// export const AdminDashboard: React.FC = () => {
//   const router = useRouter();
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const response = await fetch("/api/admin/stats");
//       const data = await response.json();

//       if (data.success) {
//         setStats(data.stats);
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
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
//       <div className="flex gap-3 mt-4 md:mt-0">
//           {/* <Link
//             href="/profile"
//             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
//           >
//             Profile
//           </Link> */}

//           {/* <Button onClick={logout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">Logout</Button> */}
//         </div>


//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white mb-8">
//         <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
//         <p className="text-blue-100">Manage your CBT platform</p>
//       </div>

//       {/* Quick Actions */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//         <button
//           onClick={() => router.push("/admin/users")}
//           className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
//         >
//           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
//             <svg
//               className="w-6 h-6 text-blue-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="font-semibold text-gray-900">Manage Users</h3>
//         </button>

//         <button
//           onClick={() => router.push("/admin/questions")}
//           className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
//         >
//           <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
//             <svg
//               className="w-6 h-6 text-green-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="font-semibold text-gray-900">Manage Questions</h3>
//         </button>

//         <button
//           onClick={() => router.push("/admin/createExam")}
//           className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
//         >
//           <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
//             <svg
//               className="w-6 h-6 text-purple-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//               />
//             </svg>
//           </div>
//           <h3 className="font-semibold text-gray-900">Manage Exams</h3>
//         </button>

//         <button
//           onClick={() => router.push(`/admin/adminResult/${examId}`)}
//           className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
//         >
//           <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
//             <svg
//               className="w-6 h-6 text-yellow-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//               />
//             </svg>
//           </div>
//           <h3 className="font-semibold text-gray-900">View Results</h3>
//         </button>
//       </div>

//       {/* Stats Overview */}
//       {stats && (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-blue-100">
//                   <svg
//                     className="w-6 h-6 text-blue-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
//                     />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     Total Students
//                   </h3>
//                   <p className="text-2xl font-bold text-blue-600">
//                     {stats.totalStudents}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-green-100">
//                   <svg
//                     className="w-6 h-6 text-green-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                     />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     Total Exams
//                   </h3>
//                   <p className="text-2xl font-bold text-green-600">
//                     {stats.totalExams}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-purple-100">
//                   <svg
//                     className="w-6 h-6 text-purple-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     Total Questions
//                   </h3>
//                   <p className="text-2xl font-bold text-purple-600">
//                     {stats.totalQuestions}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-yellow-100">
//                   <svg
//                     className="w-6 h-6 text-yellow-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                     />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     Total Results
//                   </h3>
//                   <p className="text-2xl font-bold text-yellow-600">
//                     {stats.totalResults}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Performance Metrics */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">
//                 Overall Performance
//               </h2>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Average Score</span>
//                   <span className="text-2xl font-bold text-blue-600">
//                     {stats.averageScore}%
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Passing Rate</span>
//                   <span className="text-2xl font-bold text-green-600">
//                     {stats.passingRate}%
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">
//                 Department Performance
//               </h2>
//               <div className="space-y-3">
//                 {Object.entries(stats.departmentStats).map(
//                   ([dept, deptStats]) => (
//                     <div
//                       key={dept}
//                       className="flex justify-between items-center p-3 bg-gray-50 rounded"
//                     >
//                       <div>
//                         <span className="font-medium text-gray-900">
//                           {dept}
//                         </span>
//                         <p className="text-sm text-gray-500">
//                           {deptStats.totalStudents} students
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-bold text-gray-900">
//                           {deptStats.averageScore}%
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {deptStats.passingRate}% pass rate
//                         </p>
//                       </div>
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };
