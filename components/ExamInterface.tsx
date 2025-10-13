"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "./StudentTimer";
import { Button } from "./Button";

interface Question {
  _id: string;
  text: string;
  options: string[];
  subject: string;
  department: string;
}

interface Exam {
  _id: string;
  title: string;
  duration: number;
  totalQuestions: number;
  department: string;
}

interface ExamInterfaceProps {
  examId: string;
}

interface SessionAnswer {
  questionId: string;
  selectedOption: number;
}

interface ExamSessionResponse {
  success: boolean;
  session?: {
    answers: SessionAnswer[];
    startTime: string;
    isSubmitted: boolean;
  };
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId }) => {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false); // track submitted state

  // ----------------------------
  // Submit Exam (declared early so init can call if needed)
  // ----------------------------
  const submitExam = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting || submitted) return;
      setSubmitting(true);

      try {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        //FORMER ONE
        // const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        //   questionId,
        //   selectedOption,
        // }));

        //NEW TRIAL
        const formattedAnswers = questions.map((q) => ({
          questionId: q._id,
          selectedOption: answers[q._id] ?? null,
        }));

        const response = await fetch("/api/submits",{
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId,
            answers: formattedAnswers,
            timeSpent,
            autoSubmitted: isAutoSubmit,
          }),
        });

        const result = await response.json();

        if (result.success) {
          localStorage.removeItem(`exam-${examId}-startTime`);
          localStorage.removeItem(`exam-${examId}-answers`);
          setSubmitted(true); // lock UI
          router.push(`/student/results/${result.resultId}`);
        } else {
          // If server says it's already submitted, lock UI
          if (result.message?.toLowerCase().includes("submitted")) {
            setSubmitted(true);
            return;
          }
          alert("Error submitting exam: " + result.message);
          setSubmitting(false);
        }
      } catch (error) {
        console.error("Error submitting exam:", error);
        alert("Error submitting exam. Please try again.");
        setSubmitting(false);
      }
    },
    [answers, examId, router, startTime, submitting, submitted]
  );

  // ----------------------------
  // Init: fetch exam and create/restore session
  // ----------------------------
  useEffect(() => {
    // guard
    if (!examId) {
      console.error("ExamInterface: missing examId");
      router.push("/studentDashboard");
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        // 1) fetch exam
        const resp = await fetch(`/api/exams/${examId}`);
        const data = await resp.json();
        if (!data?.success) {
          if (!cancelled) router.push("/studentDashboard");
          return;
        }
        if (!cancelled) {
          setExam(data.exam);
          setQuestions(data.exam.questions || []);
        }

        // 2) create-or-restore session (POST will return existing or create new)
        try {
          const sessResp = await fetch(`/api/exams/${examId}/session`, {
            method: "POST",
          });
          const sessData: ExamSessionResponse = await sessResp.json();

          if (sessData?.success && sessData.session) {
            const session = sessData.session;
            const sessionAnswers = session.answers || [];

            if (!cancelled) {
              setAnswers(
                Object.fromEntries(
                  sessionAnswers.map((a) => [a.questionId, a.selectedOption])
                )
              );
              const sessionStart = new Date(session.startTime).getTime();
              setStartTime(sessionStart);
              // persist immediately so refresh preserves
              localStorage.setItem(
                `exam-${examId}-startTime`,
                sessionStart.toString()
              );
              localStorage.setItem(
                `exam-${examId}-answers`,
                JSON.stringify(
                  // normalize to map {questionId: selectedOption}
                  Object.fromEntries(
                    sessionAnswers.map((a) => [a.questionId, a.selectedOption])
                  )
                )
              );
              if (session.isSubmitted) {
                setSubmitted(true);
              }

              // If session already expired, auto-submit
              const expiry = sessionStart + data.exam.duration * 60 * 1000;
              if (!session.isSubmitted && Date.now() >= expiry) {
                // auto submit once (do not await here to avoid blocking)
                await submitExam(true);
              }
            }
          } else {
            // fallback: server didn't return session (maybe unauthorized)
            // attempt to restore from localStorage or create a new local start time
            const savedStart = localStorage.getItem(`exam-${examId}-startTime`);
            const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);

            if (!cancelled) {
              if (savedStart) {
                const parsed = parseInt(savedStart, 10);
                setStartTime(parsed);
              } else {
                const now = Date.now();
                setStartTime(now);
                localStorage.setItem(
                  `exam-${examId}-startTime`,
                  now.toString()
                );
                // attempt to create session on backend (best-effort)
                try {
                  await fetch(`/api/exams/${examId}/session`, {
                    method: "POST",
                  });
                } catch (e) {
                  // ignore create failure (could be auth)
                }
              }

              if (savedAnswers) {
                try {
                  const parsedAnswers = JSON.parse(savedAnswers);
                  setAnswers(parsedAnswers);
                } catch {
                  setAnswers({});
                }
              }
            }
          }
        } catch (sessErr) {
          console.warn("Session create/restore failed:", sessErr);
          // fallback to local storage if session POST fails
          const savedStart = localStorage.getItem(`exam-${examId}-startTime`);
          const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);
          if (!cancelled) {
            if (savedStart) setStartTime(parseInt(savedStart, 10));
            else {
              const now = Date.now();
              setStartTime(now);
              localStorage.setItem(`exam-${examId}-startTime`, now.toString());
            }
            if (savedAnswers) {
              try {
                setAnswers(JSON.parse(savedAnswers));
              } catch {
                setAnswers({});
              }
            }
          }
        }
      } catch (err) {
        console.error("Init failed:", err);
        if (!cancelled) router.push("/studentDashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(e.key)) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelled = true;
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // note: submitExam included intentionally later if needed; not added to deps to avoid effect churn
  }, [examId, router]);

  // ----------------------------
  // Handle Answer Selection
  // ----------------------------
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return; // no edits after submit
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: optionIndex };
      // persist locally immediately
      localStorage.setItem(
        `exam-${examId}-answers`,
        JSON.stringify(newAnswers)
      );
      return newAnswers;
    });
  };

  // ----------------------------
  // Autosave to Server (every 15s)
  // ----------------------------
  useEffect(() => {
    if (submitted) return; // stop autosave once submitted

    const interval = setInterval(async () => {
      if (!exam) return;
      try {
        const res = await fetch(`/api/exams/${examId}/autosave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: Object.entries(answers).map(([qId, selectedOption]) => ({
              questionId: qId,
              selectedOption,
            })),
            startTime,
          }),
        });

        const data = await res.json();
        // if backend indicates already submitted, lock UI
        if (
          !data.success &&
          data.message?.toLowerCase().includes("submitted")
        ) {
          setSubmitted(true);
        }
      } catch (err) {
        console.warn("Autosave failed:", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [answers, examId, exam, startTime, submitted]);

  // ----------------------------
  // Helpers / UI actions
  // ----------------------------
  const handleTimeExpire = () => submitExam(true);
  const handleSubmitClick = () => setShowSubmitConfirm(true);
  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitExam(false);
  };

  const getExpiryTime = () => {
    if (!exam) return new Date();
    return new Date(startTime + exam.duration * 60 * 1000);
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  // ----------------------------
  // Render
  // ----------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam || !questions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">
          Exam not found or no questions available.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Timer */}
      {!submitted && (
        <Timer
          expiryTimestamp={getExpiryTime()}
          onExpire={handleTimeExpire}
          autoSubmit={true}
        />
      )}

      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Answered: {getAnsweredCount()}/{questions.length}
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(getAnsweredCount() / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-4">
                  Q{currentQuestionIndex + 1}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900">
                    {currentQuestion.text}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Subject: {currentQuestion.subject}
                  </p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion._id] === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={index}
                    checked={answers[currentQuestion._id] === index}
                    disabled={submitted}
                    onChange={() =>
                      handleAnswerSelect(currentQuestion._id, index)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      answers[currentQuestion._id] === index
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {answers[currentQuestion._id] === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-900 font-medium">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                }
                disabled={currentQuestionIndex === 0 || submitted}
              >
                Previous
              </Button>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex(
                      Math.min(questions.length - 1, currentQuestionIndex + 1)
                    )
                  }
                  disabled={
                    currentQuestionIndex === questions.length - 1 || submitted
                  }
                >
                  Next
                </Button>
                {!submitted && (
                  <Button
                    variant="danger"
                    onClick={handleSubmitClick}
                    loading={submitting}
                  >
                    Submit Exam
                  </Button>
                )}
              </div>
            </div>
          </div>

          {questions.map((q, index) => (
            <button
              key={q._id}
              onClick={() => !submitted && setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : answers[q._id] !== undefined
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
              }`}
              disabled={submitted}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && !submitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Submission
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You have answered{" "}
              {getAnsweredCount()} out of {questions.length} questions.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmSubmit}
                loading={submitting}
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//WORKING CODE BUT WHEN REFRESH, TIME STILL REFRESH, THOUGH ANSWERS ARE PRESAVE
// "use client"
// import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { Timer } from './StudentTimer';
// import { Button } from './Button';

// interface Question {
//   _id: string;
//   text: string;
//   options: string[];
//   subject: string;
//   department: string;
// }

// interface Exam {
//   _id: string;
//   title: string;
//   duration: number;
//   totalQuestions: number;
//   department: string;
// }

// interface ExamInterfaceProps {
//   examId: string;
// }

// interface SessionAnswer {
//   questionId: string;
//   selectedOption: number;
// }

// interface ExamSessionResponse {
//   success: boolean;
//   session?: {
//     answers: SessionAnswer[];
//     startTime: string;
//     isSubmitted: boolean;
//   };
// }

// export const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId }) => {
//   const router = useRouter();
//   const [exam, setExam] = useState<Exam | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [startTime, setStartTime] = useState<number>(Date.now());
//   const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
//   const [submitted, setSubmitted] = useState(false); // ✅ track submitted state

//   // ----------------------------
//   // Fetch Exam Data + Restore Session
//   // ----------------------------
//   useEffect(() => {
//     fetchExamData();
//     restoreSession();

//     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key)) {
//         e.preventDefault();
//       }
//     };

//     document.addEventListener('contextmenu', handleContextMenu);
//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('contextmenu', handleContextMenu);
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [examId]);

//   const fetchExamData = async () => {
//     try {
//       const response = await fetch(`/api/exams/${examId}`);
//       const data = await response.json();

//       if (data.success) {
//         setExam(data.exam);
//         setQuestions(data.exam.questions);
//       } else {
//         router.push('/studentDashboard');
//       }
//     } catch (error) {
//       console.error('Error fetching exam:', error);
//       router.push('/studentDashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const restoreSession = async () => {
//   try {
//     const res = await fetch(`/api/exams/${examId}/session`);
//     const data: ExamSessionResponse = await res.json();

//     if (data.success && data.session) {
//       const sessionAnswers = data.session.answers;

//       setAnswers(
//         Object.fromEntries(
//           sessionAnswers.map((a) => [a.questionId, a.selectedOption])
//         )
//       );

//       setStartTime(new Date(data.session.startTime).getTime());

//       if (data.session.isSubmitted) {
//         setSubmitted(true);
//       }
//       return;
//     }

//     // fallback localStorage
//     const savedStart = localStorage.getItem(`exam-${examId}-startTime`);
//     const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);

//     if (savedStart) setStartTime(parseInt(savedStart, 10));
//     if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
//   } catch (err) {
//     console.error("Failed to restore session:", err);
//   }
// };

//   // ----------------------------
//   // Handle Answer Selection
//   // ----------------------------
//   const handleAnswerSelect = (questionId: string, optionIndex: number) => {
//     if (submitted) return; // ✅ no edits after submit
//     setAnswers(prev => {
//       const newAnswers = { ...prev, [questionId]: optionIndex };
//       localStorage.setItem(`exam-${examId}-answers`, JSON.stringify(newAnswers));
//       return newAnswers;
//     });
//   };

//   // ----------------------------
//   // Autosave to Server
//   // ----------------------------
//   useEffect(() => {
//     if (submitted) return; // ✅ stop autosave once submitted

//     const interval = setInterval(async () => {
//       if (!exam) return;
//       try {
//         const res = await fetch(`/api/exams/${examId}/autosave`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             answers: Object.entries(answers).map(([qId, selectedOption]) => ({
//               questionId: qId,
//               selectedOption,
//             })),
//             startTime,
//           }),
//         });

//         const data = await res.json();
//         if (!data.success && data.message?.includes("submitted")) {
//           // ✅ backend says exam is already submitted
//           setSubmitted(true);
//           clearInterval(interval);
//         }
//       } catch (err) {
//         console.warn("Autosave failed:", err);
//       }
//     }, 15000);

//     return () => clearInterval(interval);
//   }, [answers, examId, exam, startTime, submitted]);

//   // ----------------------------
//   // Submit Exam
//   // ----------------------------
//   const submitExam = useCallback(async (isAutoSubmit = false) => {
//     if (submitting || submitted) return;
//     setSubmitting(true);

//     try {
//       const timeSpent = Math.floor((Date.now() - startTime) / 1000);
//       const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
//         questionId,
//         selectedOption
//       }));

//       const response = await fetch('/api/submits', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           examId,
//           answers: formattedAnswers,
//           timeSpent,
//           autoSubmitted: isAutoSubmit
//         })
//       });

//       const result = await response.json();

//       if (result.success) {
//         localStorage.removeItem(`exam-${examId}-startTime`);
//         localStorage.removeItem(`exam-${examId}-answers`);
//         setSubmitted(true); // ✅ lock exam
//         router.push(`/student/results/${result.resultId}`);
//       } else {
//         alert('Error submitting exam: ' + result.message);
//         setSubmitting(false);
//       }
//     } catch (error) {
//       console.error('Error submitting exam:', error);
//       alert('Error submitting exam. Please try again.');
//       setSubmitting(false);
//     }
//   }, [answers, examId, router, startTime, submitting, submitted]);

//   const handleTimeExpire = () => submitExam(true);
//   const handleSubmitClick = () => setShowSubmitConfirm(true);
//   const confirmSubmit = () => {
//     setShowSubmitConfirm(false);
//     submitExam(false);
//   };

//   const getExpiryTime = () => {
//     if (!exam) return new Date();
//     return new Date(startTime + exam.duration * 60 * 1000);
//   };

//   const getAnsweredCount = () => Object.keys(answers).length;

//   // ----------------------------
//   // UI
//   // ----------------------------
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!exam || !questions.length) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-500 text-lg">Exam not found or no questions available.</p>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Timer */}
//       {!submitted && (
//         <Timer expiryTimestamp={getExpiryTime()} onExpire={handleTimeExpire} autoSubmit={true} />
//       )}

//       {/* Header */}
//       <div className="bg-white shadow-md p-4">
//         <div className="container mx-auto flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
//             <p className="text-gray-600">
//               Question {currentQuestionIndex + 1} of {questions.length}
//             </p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="text-sm text-gray-600">
//               Answered: {getAnsweredCount()}/{questions.length}
//             </div>
//             <div className="w-32 bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Question */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-lg shadow-md p-8">
//             <div className="mb-8">
//               <div className="flex items-start mb-4">
//                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-4">
//                   Q{currentQuestionIndex + 1}
//                 </span>
//                 <div className="flex-1">
//                   <p className="text-lg font-medium text-gray-900">{currentQuestion.text}</p>
//                   <p className="text-sm text-gray-500 mt-2">Subject: {currentQuestion.subject}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Options */}
//             <div className="space-y-4 mb-8">
//               {currentQuestion.options.map((option, index) => (
//                 <label
//                   key={index}
//                   className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
//                     answers[currentQuestion._id] === index
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name={`question-${currentQuestion._id}`}
//                     value={index}
//                     checked={answers[currentQuestion._id] === index}
//                     disabled={submitted} // ✅ lock options
//                     onChange={() => handleAnswerSelect(currentQuestion._id, index)}
//                     className="sr-only"
//                   />
//                   <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
//                     answers[currentQuestion._id] === index
//                       ? 'border-blue-500 bg-blue-500'
//                       : 'border-gray-300'
//                   }`}>
//                     {answers[currentQuestion._id] === index && (
//                       <div className="w-2 h-2 bg-white rounded-full"></div>
//                     )}
//                   </div>
//                   <span className="text-gray-900 font-medium">
//                     {String.fromCharCode(65 + index)}. {option}
//                   </span>
//                 </label>
//               ))}
//             </div>

//             {/* Navigation */}
//             <div className="flex justify-between items-center">
//               <Button
//                 variant="outline"
//                 onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
//                 disabled={currentQuestionIndex === 0 || submitted}
//               >
//                 Previous
//               </Button>
//               <div className="flex space-x-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
//                   disabled={currentQuestionIndex === questions.length - 1 || submitted}
//                 >
//                   Next
//                 </Button>
//                 {!submitted && (
//                   <Button variant="danger" onClick={handleSubmitClick} loading={submitting}>
//                     Submit Exam
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Question Grid */}
//           <div className="bg-white rounded-lg shadow-md p-6 mt-6">
//             <h3 className="text-lg font-semibold mb-4">Question Navigation</h3>
//             <div className="grid grid-cols-10 gap-2">
//               {questions.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => !submitted && setCurrentQuestionIndex(index)}
//                   className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
//                     index === currentQuestionIndex
//                       ? 'bg-blue-600 text-white'
//                       : answers[questions[index]._id] !== undefined
//                       ? 'bg-green-100 text-green-800 border border-green-300'
//                       : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
//                   }`}
//                   disabled={submitted}
//                 >
//                   {index + 1}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Submit Confirmation Modal */}
//       {showSubmitConfirm && !submitted && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Submission</h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to submit your exam? You have answered {getAnsweredCount()} out of {questions.length} questions.
//             </p>
//             <div className="flex space-x-4">
//               <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} disabled={submitting}>
//                 Cancel
//               </Button>
//               <Button variant="danger" onClick={confirmSubmit} loading={submitting}>
//                 Submit Exam
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // working  former code before db time and auto save answer
// // components/student/ExamInterface.tsx
// "use client"
// import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { Timer } from './StudentTimer';
// import { Button } from './Button';

// interface Question {
//   _id: string;
//   text: string;
//   options: string[];
//   subject: string;
//   department: string;
// }

// interface Exam {
//   _id: string;
//   title: string;
//   duration: number;
//   totalQuestions: number;
//   department: string;
// }

// interface ExamInterfaceProps {
//   examId: string;
// }

// export const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId }) => {
//   const router = useRouter();
// //   const { data: session } = useSession();
//   const [exam, setExam] = useState<Exam | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [startTime] = useState(Date.now());
//   const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

//   useEffect(() => {
//     fetchExamData();
//     // Disable right-click context menu
//     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
//     document.addEventListener('contextmenu', handleContextMenu);

//     // Disable copy/paste shortcuts
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
//         e.preventDefault();
//       }
//     };
//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('contextmenu', handleContextMenu);
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [examId]);

//   const fetchExamData = async () => {
//     try {
//       const response = await fetch(`/api/exams/${examId}`);
//       const data = await response.json();

//       if (data.success) {
//         setExam(data.exam);
//         setQuestions(data.exam.questions);
//       } else {
//         router.push('/studentDashboard');
//       }
//     } catch (error) {
//       console.error('Error fetching exam:', error);
//       router.push('/studentDashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAnswerSelect = (questionId: string, optionIndex: number) => {
//     setAnswers(prev => ({
//       ...prev,
//       [questionId]: optionIndex
//     }));
//   };

//   const submitExam = useCallback(async (isAutoSubmit = false) => {
//     if (submitting) return;

//     setSubmitting(true);

//     try {
//       const timeSpent = Math.floor((Date.now() - startTime) / 1000);
//       const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
//         questionId,
//         selectedOption
//       }));

//       const response = await fetch('/api/submits', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           examId,
//           answers: formattedAnswers,
//           timeSpent,
//           autoSubmitted: isAutoSubmit
//         })
//       });

//       const result = await response.json();

//       if (result.success) {
//         router.push(`/student/results/${result.resultId}`);
//       } else {
//         alert('Error submitting exam: ' + result.message);
//         setSubmitting(false);
//       }
//     } catch (error) {
//       console.error('Error submitting exam:', error);
//       alert('Error submitting exam. Please try again.');
//       setSubmitting(false);
//     }
//   }, [answers, examId, router, startTime, submitting]);

//   const handleTimeExpire = () => {
//     submitExam(true);
//   };

//   const handleSubmitClick = () => {
//     setShowSubmitConfirm(true);
//   };

//   const confirmSubmit = () => {
//     setShowSubmitConfirm(false);
//     submitExam(false);
//   };

//   const getExpiryTime = () => {
//     if (!exam) return new Date();
//     return new Date(startTime + exam.duration * 60 * 1000);
//   };

//   const getAnsweredCount = () => {
//     return Object.keys(answers).length;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!exam || !questions.length) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-500 text-lg">Exam not found or no questions available.</p>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Timer */}
//       <Timer
//         expiryTimestamp={getExpiryTime()}
//         onExpire={handleTimeExpire}
//         autoSubmit={true}
//       />

//       {/* Header */}
//       <div className="bg-white shadow-md p-4">
//         <div className="container mx-auto">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
//               <p className="text-gray-600">
//                 Question {currentQuestionIndex + 1} of {questions.length}
//               </p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-600">
//                 Answered: {getAnsweredCount()}/{questions.length}
//               </div>
//               <div className="w-32 bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Question Content */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-lg shadow-md p-8">
//             {/* Question */}
//             <div className="mb-8">
//               <div className="flex items-start mb-4">
//                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-4">
//                   Q{currentQuestionIndex + 1}
//                 </span>
//                 <div className="flex-1">
//                   <p className="text-lg font-medium text-gray-900 leading-relaxed">
//                     {currentQuestion.text}
//                   </p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Subject: {currentQuestion.subject}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Options */}
//             <div className="space-y-4 mb-8">
//               {currentQuestion.options.map((option, index) => (
//                 <label
//                   key={index}
//                   className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
//                     answers[currentQuestion._id] === index
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name={`question-${currentQuestion._id}`}
//                     value={index}
//                     checked={answers[currentQuestion._id] === index}
//                     onChange={() => handleAnswerSelect(currentQuestion._id, index)}
//                     className="sr-only"
//                   />
//                   <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
//                     answers[currentQuestion._id] === index
//                       ? 'border-blue-500 bg-blue-500'
//                       : 'border-gray-300'
//                   }`}>
//                     {answers[currentQuestion._id] === index && (
//                       <div className="w-2 h-2 bg-white rounded-full"></div>
//                     )}
//                   </div>
//                   <span className="text-gray-900 font-medium">
//                     {String.fromCharCode(65 + index)}. {option}
//                   </span>
//                 </label>
//               ))}
//             </div>

//             {/* Navigation */}
//             <div className="flex justify-between items-center">
//               <Button
//                 variant="outline"
//                 onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
//                 disabled={currentQuestionIndex === 0}
//               >
//                 Previous
//               </Button>

//               <div className="flex space-x-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
//                   disabled={currentQuestionIndex === questions.length - 1}
//                 >
//                   Next
//                 </Button>

//                 <Button
//                   variant="danger"
//                   onClick={handleSubmitClick}
//                   loading={submitting}
//                 >
//                   Submit Exam
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Question Grid */}
//           <div className="bg-white rounded-lg shadow-md p-6 mt-6">
//             <h3 className="text-lg font-semibold mb-4">Question Navigation</h3>
//             <div className="grid grid-cols-10 gap-2">
//               {questions.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentQuestionIndex(index)}
//                   className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
//                     index === currentQuestionIndex
//                       ? 'bg-blue-600 text-white'
//                       : answers[questions[index]._id] !== undefined
//                       ? 'bg-green-100 text-green-800 border border-green-300'
//                       : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
//                   }`}
//                 >
//                   {index + 1}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Submit Confirmation Modal */}
//       {showSubmitConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Submission</h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to submit your exam? You have answered {getAnsweredCount()} out of {questions.length} questions.
//               You wont be able to make changes after submission.
//             </p>
//             <div className="flex space-x-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowSubmitConfirm(false)}
//                 disabled={submitting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="danger"
//                 onClick={confirmSubmit}
//                 loading={submitting}
//               >
//                 Submit Exam
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { Timer } from "./StudentTimer";
// import { Button } from "./Button";

// interface Question {
//   _id: string;
//   text: string;
//   options: string[];
//   subject: string;
//   department: string;
// }

// interface Exam {
//   _id: string;
//   title: string;
//   duration: number; // in minutes
//   totalQuestions: number;
//   department: string;
//   questions: Question[];
// }

// interface ExamInterfaceProps {
//   examId: string;
// }

// export const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId }) => {
//   const router = useRouter();

//   const [exam, setExam] = useState<Exam | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [startTime, setStartTime] = useState<number | null>(null);
//   const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

//   // Disable right-click and copy/paste
//   useEffect(() => {
//     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(e.key)) {
//         e.preventDefault();
//       }
//     };

//     document.addEventListener("contextmenu", handleContextMenu);
//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("contextmenu", handleContextMenu);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   // Fetch exam data from the server
//   useEffect(() => {
//     const fetchExamData = async () => {
//       try {
//         const response = await fetch(`/api/exams/${examId}/start`, {
//           method: "POST",
//         });
//         const data = await response.json();

//         if (data.success) {
//           setExam(data.exam);
//           setQuestions(data.exam.questions);

//           // Always use the server start time (consistent across reloads)
//           const serverStartTime = new Date(data.startTime).getTime();
//           setStartTime(serverStartTime);
//         } else {
//           alert(data.message || "Unable to start exam.");
//           router.push("/studentDashboard");
//         }
//       } catch (error) {
//         console.error("Error fetching exam:", error);
//         router.push("/studentDashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExamData();
//   }, [examId, router]);

//   const handleAnswerSelect = (questionId: string, optionIndex: number) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: optionIndex,
//     }));
//   };

//   const submitExam = useCallback(
//     async (isAutoSubmit = false) => {
//       if (submitting || !startTime) return;
//       setSubmitting(true);

//       try {
//         const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds
//         const formattedAnswers = Object.entries(answers).map(
//           ([questionId, selectedOption]) => ({
//             questionId,
//             selectedOption,
//           })
//         );

//         const response = await fetch("/api/submits", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             examId,
//             answers: formattedAnswers,
//             timeSpent,
//             autoSubmitted: isAutoSubmit,
//           }),
//         });

//         const result = await response.json();

//         if (result.success) {
//           router.push(`/student/results/${result.resultId}`);
//         } else {
//           alert("Error submitting exam: " + result.message);
//           setSubmitting(false);
//         }
//       } catch (error) {
//         console.error("Error submitting exam:", error);
//         alert("Error submitting exam. Please try again.");
//         setSubmitting(false);
//       }
//     },
//     [answers, examId, router, startTime, submitting]
//   );

//   const handleTimeExpire = () => submitExam(true);

//   const handleSubmitClick = () => setShowSubmitConfirm(true);

//   const confirmSubmit = () => {
//     setShowSubmitConfirm(false);
//     submitExam(false);
//   };

//   const getExpiryTime = () => {
//     if (!exam || !startTime) return new Date();
//     return new Date(startTime + exam.duration * 60 * 1000);
//   };

//   const getAnsweredCount = () => Object.keys(answers).length;

//   // --- UI Loading & Guards ---
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!exam || !questions.length || !startTime) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-500 text-lg">
//           Exam not found or could not be started.
//         </p>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   // --- MAIN RENDER ---
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Timer */}
//       <Timer
//         expiryTimestamp={getExpiryTime()}
//         onExpire={handleTimeExpire}
//         autoSubmit={true}
//       />

//       {/* Header */}
//       <div className="bg-white shadow-md p-4">
//         <div className="container mx-auto">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {exam.title}
//               </h1>
//               <p className="text-gray-600">
//                 Question {currentQuestionIndex + 1} of {questions.length}
//               </p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-600">
//                 Answered: {getAnsweredCount()}/{questions.length}
//               </div>
//               <div className="w-32 bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                   style={{
//                     width: `${
//                       (getAnsweredCount() / questions.length) * 100
//                     }%`,
//                   }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Question Content */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-lg shadow-md p-8">
//             {/* Question */}
//             <div className="mb-8">
//               <div className="flex items-start mb-4">
//                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-4">
//                   Q{currentQuestionIndex + 1}
//                 </span>
//                 <div className="flex-1">
//                   <p className="text-lg font-medium text-gray-900 leading-relaxed">
//                     {currentQuestion.text}
//                   </p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Subject: {currentQuestion.subject}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Options */}
//             <div className="space-y-4 mb-8">
//               {currentQuestion.options.map((option, index) => (
//                 <label
//                   key={index}
//                   className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
//                     answers[currentQuestion._id] === index
//                       ? "border-blue-500 bg-blue-50"
//                       : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name={`question-${currentQuestion._id}`}
//                     value={index}
//                     checked={answers[currentQuestion._id] === index}
//                     onChange={() =>
//                       handleAnswerSelect(currentQuestion._id, index)
//                     }
//                     className="sr-only"
//                   />
//                   <div
//                     className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
//                       answers[currentQuestion._id] === index
//                         ? "border-blue-500 bg-blue-500"
//                         : "border-gray-300"
//                     }`}
//                   >
//                     {answers[currentQuestion._id] === index && (
//                       <div className="w-2 h-2 bg-white rounded-full"></div>
//                     )}
//                   </div>
//                   <span className="text-gray-900 font-medium">
//                     {String.fromCharCode(65 + index)}. {option}
//                   </span>
//                 </label>
//               ))}
//             </div>

//             {/* Navigation */}
//             <div className="flex justify-between items-center">
//               <Button
//                 variant="outline"
//                 onClick={() =>
//                   setCurrentQuestionIndex(
//                     Math.max(0, currentQuestionIndex - 1)
//                   )
//                 }
//                 disabled={currentQuestionIndex === 0}
//               >
//                 Previous
//               </Button>

//               <div className="flex space-x-4">
//                 <Button
//                   variant="outline"
//                   onClick={() =>
//                     setCurrentQuestionIndex(
//                       Math.min(questions.length - 1, currentQuestionIndex + 1)
//                     )
//                   }
//                   disabled={currentQuestionIndex === questions.length - 1}
//                 >
//                   Next
//                 </Button>

//                 <Button
//                   variant="danger"
//                   onClick={handleSubmitClick}
//                   loading={submitting}
//                 >
//                   Submit Exam
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Question Grid */}
//           <div className="bg-white rounded-lg shadow-md p-6 mt-6">
//             <h3 className="text-lg font-semibold mb-4">Question Navigation</h3>
//             <div className="grid grid-cols-10 gap-2">
//               {questions.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentQuestionIndex(index)}
//                   className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
//                     index === currentQuestionIndex
//                       ? "bg-blue-600 text-white"
//                       : answers[questions[index]._id] !== undefined
//                       ? "bg-green-100 text-green-800 border border-green-300"
//                       : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
//                   }`}
//                 >
//                   {index + 1}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Submit Confirmation Modal */}
//       {showSubmitConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h3 className="text-xl font-bold text-gray-900 mb-4">
//               Confirm Submission
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to submit your exam? You have answered{" "}
//               {getAnsweredCount()} out of {questions.length} questions. You
//               won’t be able to make changes after submission.
//             </p>
//             <div className="flex space-x-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowSubmitConfirm(false)}
//                 disabled={submitting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="danger"
//                 onClick={confirmSubmit}
//                 loading={submitting}
//               >
//                 Submit Exam
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { Timer } from "./StudentTimer";
// import { Button } from "./Button";

// interface Question {
//   _id: string;
//   text: string;
//   options: string[];
//   subject: string;
//   department: string;
// }

// interface Exam {
//   _id: string;
//   title: string;
//   duration: number; // in minutes
//   totalQuestions: number;
//   department: string;
//   questions: Question[];
// }

// interface ExamInterfaceProps {
//   examId: string;
// }

// export const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId }) => {
//   const router = useRouter();

//   const [exam, setExam] = useState<Exam | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [startTime, setStartTime] = useState<number | null>(null);
//   const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

//   // Disable right-click and copy/paste
//   useEffect(() => {
//     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(e.key)) {
//         e.preventDefault();
//       }
//     };

//     document.addEventListener("contextmenu", handleContextMenu);
//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("contextmenu", handleContextMenu);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   // Fetch exam data from the server
//   useEffect(() => {
//     const fetchExamData = async () => {
//       try {
//         const response = await fetch(`/api/exams/${examId}/start`, {
//           method: "POST",
//         });
//         const data = await response.json();

//         if (data.success) {
//           setExam(data.exam);
//           setQuestions(data.exam.questions);

//           // Always use the server start time (consistent across reloads)
//           const serverStartTime = new Date(data.startTime).getTime();
//           setStartTime(serverStartTime);
//         } else {
//           alert(data.message || "Unable to start exam.");
//           router.push("/studentDashboard");
//         }
//       } catch (error) {
//         console.error("Error fetching exam:", error);
//         router.push("/studentDashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExamData();
//   }, [examId, router]);

//   const handleAnswerSelect = (questionId: string, optionIndex: number) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: optionIndex,
//     }));
//   };

//   const submitExam = useCallback(
//     async (isAutoSubmit = false) => {
//       if (submitting || !startTime) return;
//       setSubmitting(true);

//       try {
//         const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds
//         const formattedAnswers = Object.entries(answers).map(
//           ([questionId, selectedOption]) => ({
//             questionId,
//             selectedOption,
//           })
//         );

//         const response = await fetch("/api/submits", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             examId,
//             answers: formattedAnswers,
//             timeSpent,
//             autoSubmitted: isAutoSubmit,
//           }),
//         });

//         const result = await response.json();

//         if (result.success) {
//           router.push(`/student/results/${result.resultId}`);
//         } else {
//           alert("Error submitting exam: " + result.message);
//           setSubmitting(false);
//         }
//       } catch (error) {
//         console.error("Error submitting exam:", error);
//         alert("Error submitting exam. Please try again.");
//         setSubmitting(false);
//       }
//     },
//     [answers, examId, router, startTime, submitting]
//   );

//   const handleTimeExpire = () => submitExam(true);

//   const handleSubmitClick = () => setShowSubmitConfirm(true);

//   const confirmSubmit = () => {
//     setShowSubmitConfirm(false);
//     submitExam(false);
//   };

//   const getExpiryTime = () => {
//     if (!exam || !startTime) return new Date();
//     return new Date(startTime + exam.duration * 60 * 1000);
//   };

//   const getAnsweredCount = () => Object.keys(answers).length;

//   // --- UI Loading & Guards ---
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!exam || !questions.length || !startTime) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-500 text-lg">
//           Exam not found or could not be started.
//         </p>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   // --- MAIN RENDER ---
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Timer */}
//       <Timer
//         expiryTimestamp={getExpiryTime()}
//         onExpire={handleTimeExpire}
//         autoSubmit={true}
//       />

//       {/* Header */}
//       <div className="bg-white shadow-md p-4">
//         <div className="container mx-auto">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {exam.title}
//               </h1>
//               <p className="text-gray-600">
//                 Question {currentQuestionIndex + 1} of {questions.length}
//               </p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-600">
//                 Answered: {getAnsweredCount()}/{questions.length}
//               </div>
//               <div className="w-32 bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                   style={{
//                     width: `${
//                       (getAnsweredCount() / questions.length) * 100
//                     }%`,
//                   }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Question Content */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-lg shadow-md p-8">
//             {/* Question */}
//             <div className="mb-8">
//               <div className="flex items-start mb-4">
//                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-4">
//                   Q{currentQuestionIndex + 1}
//                 </span>
//                 <div className="flex-1">
//                   <p className="text-lg font-medium text-gray-900 leading-relaxed">
//                     {currentQuestion.text}
//                   </p>
//                   <p className="text-sm text-gray-500 mt-2">
//                     Subject: {currentQuestion.subject}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Options */}
//             <div className="space-y-4 mb-8">
//               {currentQuestion.options.map((option, index) => (
//                 <label
//                   key={index}
//                   className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
//                     answers[currentQuestion._id] === index
//                       ? "border-blue-500 bg-blue-50"
//                       : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name={`question-${currentQuestion._id}`}
//                     value={index}
//                     checked={answers[currentQuestion._id] === index}
//                     onChange={() =>
//                       handleAnswerSelect(currentQuestion._id, index)
//                     }
//                     className="sr-only"
//                   />
//                   <div
//                     className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
//                       answers[currentQuestion._id] === index
//                         ? "border-blue-500 bg-blue-500"
//                         : "border-gray-300"
//                     }`}
//                   >
//                     {answers[currentQuestion._id] === index && (
//                       <div className="w-2 h-2 bg-white rounded-full"></div>
//                     )}
//                   </div>
//                   <span className="text-gray-900 font-medium">
//                     {String.fromCharCode(65 + index)}. {option}
//                   </span>
//                 </label>
//               ))}
//             </div>

//             {/* Navigation */}
//             <div className="flex justify-between items-center">
//               <Button
//                 variant="outline"
//                 onClick={() =>
//                   setCurrentQuestionIndex(
//                     Math.max(0, currentQuestionIndex - 1)
//                   )
//                 }
//                 disabled={currentQuestionIndex === 0}
//               >
//                 Previous
//               </Button>

//               <div className="flex space-x-4">
//                 <Button
//                   variant="outline"
//                   onClick={() =>
//                     setCurrentQuestionIndex(
//                       Math.min(questions.length - 1, currentQuestionIndex + 1)
//                     )
//                   }
//                   disabled={currentQuestionIndex === questions.length - 1}
//                 >
//                   Next
//                 </Button>

//                 <Button
//                   variant="danger"
//                   onClick={handleSubmitClick}
//                   loading={submitting}
//                 >
//                   Submit Exam
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Question Grid */}
//           <div className="bg-white rounded-lg shadow-md p-6 mt-6">
//             <h3 className="text-lg font-semibold mb-4">Question Navigation</h3>
//             <div className="grid grid-cols-10 gap-2">
//               {questions.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentQuestionIndex(index)}
//                   className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
//                     index === currentQuestionIndex
//                       ? "bg-blue-600 text-white"
//                       : answers[questions[index]._id] !== undefined
//                       ? "bg-green-100 text-green-800 border border-green-300"
//                       : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
//                   }`}
//                 >
//                   {index + 1}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Submit Confirmation Modal */}
//       {showSubmitConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h3 className="text-xl font-bold text-gray-900 mb-4">
//               Confirm Submission
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to submit your exam? You have answered{" "}
//               {getAnsweredCount()} out of {questions.length} questions. You
//               won’t be able to make changes after submission.
//             </p>
//             <div className="flex space-x-4">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowSubmitConfirm(false)}
//                 disabled={submitting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="danger"
//                 onClick={confirmSubmit}
//                 loading={submitting}
//               >
//                 Submit Exam
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
