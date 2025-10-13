"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import Link from "next/link";
import { logout } from "@/lib/user-action";

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

  useEffect(() => {
    const fetchData = async () => {
      if (!user.department) return;
      try {
        const examsResponse = await fetch(
          `/api/exams?department=${user.department}`
        );
        const examsData = await examsResponse.json();
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

  const handleStartExam = (examId: string) =>
    router.push(`/examInterface/${examId}`);

  const hasAttempted = (examId: string) =>
    results.some((result) => result.examId?._id === examId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-8">
      {/* Top Bar */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-10 bg-white rounded-xl shadow-md p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">
            Student Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back, <span className="font-semibold">{user.name}!</span> 👋
          </p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href="/profile"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            Profile
          </Link>

          {/* <Button onClick={logout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition">Logout</Button> */}
        </div>
      </header>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-gray-500 font-medium">Available Exams</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {exams.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-gray-500 font-medium">Completed</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">
            {results.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-gray-500 font-medium">Average Score</h3>
          <p className="text-4xl font-bold text-yellow-500 mt-2">
            {results.length > 0
              ? Math.round(
                  results.reduce((sum, r) => sum + r.percentage, 0) /
                    results.length
                )
              : 0}
            %
          </p>
        </div>
      </section>

      {/* Exams List */}
      <section className="bg-white rounded-xl shadow-md p-6 mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Available Exams
        </h2>
        {exams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No exams available right now.
          </p>
        ) : (
          <div className="grid gap-6">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition bg-gradient-to-r from-blue-50 to-white"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {exam.title}
                    </h3>
                    {exam.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {exam.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {exam.duration} min • {exam.totalQuestions} questions
                    </p>
                  </div>
                  <div>
                    {hasAttempted(exam._id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/student/results/${
                              results.find((r) => r.examId?._id === exam._id)
                                ?._id
                            }`
                          )
                        }
                      >
                        View Result
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleStartExam(exam._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                      >
                        Start Exam
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Results */}
      {results.length > 0 && (
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
            Recent Results
          </h2>
          <div className="divide-y divide-gray-200">
            {results.slice(0, 5).map((result) => (
              <div
                key={result._id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {result.examId?.title || "Exam Deleted"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(result.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${
                    result.percentage >= 50
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {Math.round(result.percentage)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
