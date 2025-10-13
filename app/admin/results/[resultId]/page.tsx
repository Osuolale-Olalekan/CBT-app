"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/Button";

interface ResultData {
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

const ResultDetailsPage: React.FC = () => {
  const params = useParams<{ resultId: string }>();
  const resultId = params?.resultId; // ✅ no "any"
  const router = useRouter();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return; // don’t fetch until param is ready
    fetchResult();
  }, [resultId]);

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/results/${resultId}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        alert("Could not load result.");
        router.push("/admin/adminDashboard");
      }
    } catch (error) {
      console.error("Error fetching result:", error);
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

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Result not found</p>
        <Button onClick={() => router.push("/admin/adminDashboard")}>Back</Button>
      </div>
    );
  }

  const passed = result.percentage >= result.examId.passingScore;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {result.examId.title}
        </h1>
        <p className="text-gray-600">
          Student: {result.userId.name} ({result.userId.email})
        </p>
        <p className="text-gray-600 mb-4">Department: {result.userId.department}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Score</p>
            <p className="text-xl font-semibold">
              {result.score}/{result.examId.totalQuestions}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Percentage</p>
            <p className="text-xl font-semibold">{result.percentage}%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Time Spent</p>
            <p className="text-xl font-semibold">
              {Math.floor(result.timeSpent / 60)}:
              {(result.timeSpent % 60).toString().padStart(2, "0")}
            </p>
          </div>
          {/* <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                passed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {passed ? "PASSED" : "FAILED"}
            </span>
          </div> */}
        </div>

        <div className="mt-6">
          <Button onClick={() => router.push(`/admin/adminResult/${resultId}`)}>Back to Results</Button>
        </div>
      </div>
    </div>
  );
};

export default ResultDetailsPage;
