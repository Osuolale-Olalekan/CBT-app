// components/admin/AdminResultsPage.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/Button";

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
  examId: string;
}

export const AdminResultsPage: React.FC<AdminResultsPageProps> = ({ examId }) => {
  const router = useRouter();
  const [results, setResults] = useState<AdminResultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/results`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        alert("Could not load results.");
        router.push("/admin/adminDashboard");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      router.push("/admin/adminDashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600">Overview of all students who took this exam</p>
        </div>
        <Button onClick={() => router.push("/admin/adminDashboard")}>Back</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Student</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Email</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Department</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Score</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Percentage</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Time Spent</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Submitted</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {results.map((res) => {
              const passed = res.percentage >= res.examId.passingScore;
              return (
                <tr key={res._id} className="border-t">
                  <td className="px-6 py-4">{res.userId.name}</td>
                  <td className="px-6 py-4">{res.userId.email}</td>
                  <td className="px-6 py-4">{res.userId.department}</td>
                  <td className="px-6 py-4">
                    {res.score}/{res.examId.totalQuestions}
                  </td>
                  <td className="px-6 py-4">{res.percentage}%</td>
                  <td className="px-6 py-4">
                    {Math.floor(res.timeSpent / 60)}:
                    {(res.timeSpent % 60).toString().padStart(2, "0")}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(res.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        passed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {passed ? "PASSED" : "FAILED"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/admin/results/${res._id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
