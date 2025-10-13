// app/exams/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Exam {
  _id: string;
  title: string;
  department: string;
  duration: number;
}

const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    async function fetchExams() {
      const res = await fetch("/api/exams");
      const data = await res.json();
      if (data.success) {
        setExams(data.exams);
      }
    }
    fetchExams();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Exams</h1>
      <ul>
        {exams.map((exam) => (
          <li key={exam._id} className="mb-3 border p-3 rounded">
            <h2 className="text-lg font-semibold">{exam.title}</h2>
            <p>Department: {exam.department}</p>
            <p>Duration: {exam.duration} mins</p>
            <Link
              href={`/examInterface/${exam._id}`}
              className="text-blue-600 underline"
            >
              Start Exam
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExamsPage;
