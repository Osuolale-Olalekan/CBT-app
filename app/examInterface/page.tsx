import Link from "next/link";

export default async function ExamListPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/exams`, { cache: "no-store" });
  const data = await res.json();

  if (!data.success) {
    return <div>Failed to load exams</div>;
  }

  const exams = data.exams;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Available Exams</h1>
      <ul className="space-y-4">
        {exams.map((exam: { _id: string; title: string; department: string }) => (
          <li key={exam._id} className="p-4 border rounded-lg shadow">
            <h2 className="text-xl font-semibold">{exam.title}</h2>
            <p className="text-gray-600">Department: {exam.department}</p>
            <Link
              href={`/examInterface/${exam._id}`}
              className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Exam
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}



// import { ExamInterface } from "@/components/ExamInterface";
// import React from "react";

// const Page = () => {
//   return (
//     <div>
//       <ExamInterface/>
      
//     </div>
//   );
// };

// export default Page;
