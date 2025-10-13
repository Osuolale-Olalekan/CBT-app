// import { ResultsPage } from "@/components/ResultPage";
// import React from "react";

// const Page = ({ params }: { params: { resultId: string } }) => {
//   return (
//     <div>
//       <ResultsPage resultId={params.resultId} />
//     </div>
//   );
// };

// export default Page;

// app/student/results/[resultId]/page.tsx
import React from "react";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import Result from "@/models/Result";
import { ResultsPage } from "@/components/ResultPage";
import { jwtVerify } from "jose";

const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

interface PageProps {
  params: { resultId: string };
}

export default async function Page({ params }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return (
      <p className="text-center py-8 text-red-500">
        You must be logged in to view this page.
      </p>
    );
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, encodedSecret, {
      algorithms: ["HS256"],
    });
    userId = payload.id as string;
  } catch (err) {
    return (
      <p className="text-center py-8 text-red-500">
        Invalid or expired token. Please log in again.
      </p>
    );
  }

  await dbConnect();

  const result = await Result.findById(params.resultId)
    .populate("userId", "name email department")
    .populate("examId", "title totalQuestions passingScore department")
    .populate(
      "answers.questionId",
      "text options correctOption subject options"
    );

  if (!result) {
    return <p className="text-center py-8 text-gray-500">Result not found.</p>;
  }

  if (result.userId._id.toString() !== userId) {
    return (
      <p className="text-center py-8 text-red-500">
        You are not authorized to view this result.
      </p>
    );
  }

  const serializedResult = JSON.parse(JSON.stringify(result));

  return (
    <div className="container mx-auto px-4 py-8">
      <ResultsPage result={serializedResult} />
    </div>
  );
}
