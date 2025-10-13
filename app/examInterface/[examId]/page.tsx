// app/student/exam/[examId]/page.tsx
// import { ExamInterface } from "@/components/ExamInterface";

// interface ExamPageProps {
//   params: { examId: string };
// }

// export default function ExamPage({ params }: ExamPageProps) {
//   return (
//     <div>
//       <ExamInterface examId={params.examId} />
//     </div>
//   );
// }

import { ExamInterface } from "@/components/ExamInterface";

interface ExamPageProps {
  params: { examId: string };
}

export default function ExamPage({ params }: ExamPageProps) {
  return <ExamInterface examId={params.examId} />;
}


// app/student/exam/[examId]/page.tsx
// import { ExamInterface } from "@/components/ExamInterface";

// export default async function ExamPage({
//   params,
// }: {
//   params: Promise<{ examId: string }>;
// }) {
//   const { examId } = await params; // ✅ await params properly

//   return (
//     <div>
//       <ExamInterface examId={examId} />
//     </div>
//   );
// }
