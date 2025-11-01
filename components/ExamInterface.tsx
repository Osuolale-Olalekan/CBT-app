"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "./StudentTimer";
import { Button } from "./Button";
import { CheckCircle, Circle, Clock, FileText, Menu, X } from "lucide-react";

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
  const [submitted, setSubmitted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Submit Exam
  const submitExam = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting || submitted) return;
      setSubmitting(true);

      try {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        const formattedAnswers = questions.map((q) => ({
          questionId: q._id,
          selectedOption: answers[q._id] ?? null,
        }));

        const response = await fetch("/api/submits", {
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
          setSubmitted(true);
          router.push(`/student/results/${result.resultId}`);
        } else {
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
    [answers, examId, router, startTime, submitting, submitted, questions]
  );

  // Init: fetch exam and create/restore session
  useEffect(() => {
    if (!examId) {
      console.error("ExamInterface: missing examId");
      router.push("/studentDashboard");
      return;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
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
              localStorage.setItem(
                `exam-${examId}-startTime`,
                sessionStart.toString()
              );
              localStorage.setItem(
                `exam-${examId}-answers`,
                JSON.stringify(
                  Object.fromEntries(
                    sessionAnswers.map((a) => [a.questionId, a.selectedOption])
                  )
                )
              );
              if (session.isSubmitted) {
                setSubmitted(true);
              }

              const expiry = sessionStart + data.exam.duration * 60 * 1000;
              if (!session.isSubmitted && Date.now() >= expiry) {
                await submitExam(true);
              }
            }
          } else {
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
                try {
                  await fetch(`/api/exams/${examId}/session`, {
                    method: "POST",
                  });
                } catch (e) {}
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
  }, [examId, router]);

  // Handle Answer Selection
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: optionIndex };
      localStorage.setItem(
        `exam-${examId}-answers`,
        JSON.stringify(newAnswers)
      );
      return newAnswers;
    });
  };

  // Autosave to Server
  useEffect(() => {
    if (submitted) return;

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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-blue-600 absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-blue-600 font-medium">Loading exam...</p>
      </div>
    );
  }

  if (!exam || !questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            Exam not found or no questions available.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (getAnsweredCount() / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Title */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="hidden sm:flex w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {exam.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            {/* Right: Timer & Menu */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {!submitted && (
                <div className="hidden sm:block">
                  <Timer
                    expiryTimestamp={getExpiryTime()}
                    onExpire={handleTimeExpire}
                    autoSubmit={true}
                  />
                </div>
              )}
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Timer */}
          {!submitted && (
            <div className="sm:hidden pb-3">
              <Timer
                expiryTimestamp={getExpiryTime()}
                onExpire={handleTimeExpire}
                autoSubmit={true}
              />
            </div>
          )}

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-xs sm:text-sm font-semibold text-blue-600">
                {getAnsweredCount()}/{questions.length} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 sm:pt-40 mt-16  pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Question Area */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Question Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-lg">
                        {currentQuestionIndex + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                        {currentQuestion.text}
                      </p>
                      <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                        <span className="text-xs sm:text-sm text-white">
                          {currentQuestion.subject}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion._id] === index;
                    return (
                      <label
                        key={index}
                        className={`group flex items-start p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
                        } ${submitted ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={index}
                          checked={isSelected}
                          disabled={submitted}
                          onChange={() =>
                            handleAnswerSelect(currentQuestion._id, index)
                          }
                          className="sr-only"
                        />
                        <div className="flex-shrink-0 mt-0.5">
                          {isSelected ? (
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                          ) : (
                            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          )}
                        </div>
                        <div className="ml-3 sm:ml-4 flex-1">
                          <div className="flex items-baseline">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 sm:mr-3 ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span
                              className={`text-sm sm:text-base ${
                                isSelected
                                  ? "text-gray-900 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {option}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="border-t border-gray-100 p-4 sm:p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.max(0, currentQuestionIndex - 1)
                        )
                      }
                      disabled={currentQuestionIndex === 0 || submitted}
                      className="w-full sm:w-auto"
                    >
                      ← Previous
                    </Button>
                    <div className="flex space-x-3 w-full sm:w-auto">
                      {currentQuestionIndex < questions.length - 1 ? (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setCurrentQuestionIndex(
                              Math.min(
                                questions.length - 1,
                                currentQuestionIndex + 1
                              )
                            )
                          }
                          disabled={submitted}
                          className="flex-1 sm:flex-initial"
                        >
                          Next →
                        </Button>
                      ) : null}
                      {!submitted && (
                        <Button
                          variant="danger"
                          onClick={handleSubmitClick}
                          loading={submitting}
                          className="flex-1 sm:flex-initial bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        >
                          Submit Exam
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Question Navigator */}
            <div
              className={`
              lg:col-span-4 mt-6 lg:mt-0
              ${showSidebar ? "block" : "hidden lg:block"}
            `}
            >
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 sticky top-44">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  Question Navigator
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = answers[q._id] !== undefined;
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <button
                        key={q._id}
                        onClick={() =>
                          !submitted && setCurrentQuestionIndex(index)
                        }
                        disabled={submitted}
                        className={`
                          relative h-12 sm:h-14 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200
                          ${
                            isCurrent
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-110 z-10"
                              : isAnswered
                              ? "bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200"
                          }
                          ${submitted ? "opacity-60 cursor-not-allowed" : ""}
                        `}
                      >
                        {index + 1}
                        {isAnswered && !isCurrent && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600"></div>
                    <span className="text-gray-600">Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-300"></div>
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-gray-100 border-2 border-gray-200"></div>
                    <span className="text-gray-600">Unanswered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && !submitted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Submit Exam?
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-2">
                Are you sure you want to submit your exam?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Questions answered:</span>
                  <span className="font-bold text-blue-600">
                    {getAnsweredCount()} / {questions.length}
                  </span>
                </div>
                {getAnsweredCount() < questions.length && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ You have {questions.length - getAnsweredCount()}{" "}
                    unanswered question(s)
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitConfirm(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmSubmit}
                  loading={submitting}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  {submitting ? "Submitting..." : "Submit Exam"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



//THE CODE BELOW IS WORKING BUT THE ONE ABOVE IS JUST AN IMPROVED DESIGN --- THANK YOU 😊

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
//   const [submitted, setSubmitted] = useState(false); // track submitted state

//   // ----------------------------
//   // Submit Exam (declared early so init can call if needed)
//   // ----------------------------
//   const submitExam = useCallback(
//     async (isAutoSubmit = false) => {
//       if (submitting || submitted) return;
//       setSubmitting(true);

//       try {
//         const timeSpent = Math.floor((Date.now() - startTime) / 1000);

//         //FORMER ONE
//         // const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
//         //   questionId,
//         //   selectedOption,
//         // }));

//         //NEW TRIAL
//         const formattedAnswers = questions.map((q) => ({
//           questionId: q._id,
//           selectedOption: answers[q._id] ?? null,
//         }));

//         const response = await fetch("/api/submits",{
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             examId,
//             answers: formattedAnswers,
//             timeSpent,
//             autoSubmitted: isAutoSubmit,
//           }),
//         });

//         const result = await response.json();

//         if (result.success) {
//           localStorage.removeItem(`exam-${examId}-startTime`);
//           localStorage.removeItem(`exam-${examId}-answers`);
//           setSubmitted(true); // lock UI
//           router.push(`/student/results/${result.resultId}`);
//         } else {
//           // If server says it's already submitted, lock UI
//           if (result.message?.toLowerCase().includes("submitted")) {
//             setSubmitted(true);
//             return;
//           }
//           alert("Error submitting exam: " + result.message);
//           setSubmitting(false);
//         }
//       } catch (error) {
//         console.error("Error submitting exam:", error);
//         alert("Error submitting exam. Please try again.");
//         setSubmitting(false);
//       }
//     },
//     [answers, examId, router, startTime, submitting, submitted]
//   );

//   // ----------------------------
//   // Init: fetch exam and create/restore session
//   // ----------------------------
//   useEffect(() => {
//     // guard
//     if (!examId) {
//       console.error("ExamInterface: missing examId");
//       router.push("/studentDashboard");
//       return;
//     }

//     let cancelled = false;

//     const init = async () => {
//       setLoading(true);
//       try {
//         // 1) fetch exam
//         const resp = await fetch(`/api/exams/${examId}`);
//         const data = await resp.json();
//         if (!data?.success) {
//           if (!cancelled) router.push("/studentDashboard");
//           return;
//         }
//         if (!cancelled) {
//           setExam(data.exam);
//           setQuestions(data.exam.questions || []);
//         }

//         // 2) create-or-restore session (POST will return existing or create new)
//         try {
//           const sessResp = await fetch(`/api/exams/${examId}/session`, {
//             method: "POST",
//           });
//           const sessData: ExamSessionResponse = await sessResp.json();

//           if (sessData?.success && sessData.session) {
//             const session = sessData.session;
//             const sessionAnswers = session.answers || [];

//             if (!cancelled) {
//               setAnswers(
//                 Object.fromEntries(
//                   sessionAnswers.map((a) => [a.questionId, a.selectedOption])
//                 )
//               );
//               const sessionStart = new Date(session.startTime).getTime();
//               setStartTime(sessionStart);
//               // persist immediately so refresh preserves
//               localStorage.setItem(
//                 `exam-${examId}-startTime`,
//                 sessionStart.toString()
//               );
//               localStorage.setItem(
//                 `exam-${examId}-answers`,
//                 JSON.stringify(
//                   // normalize to map {questionId: selectedOption}
//                   Object.fromEntries(
//                     sessionAnswers.map((a) => [a.questionId, a.selectedOption])
//                   )
//                 )
//               );
//               if (session.isSubmitted) {
//                 setSubmitted(true);
//               }

//               // If session already expired, auto-submit
//               const expiry = sessionStart + data.exam.duration * 60 * 1000;
//               if (!session.isSubmitted && Date.now() >= expiry) {
//                 // auto submit once (do not await here to avoid blocking)
//                 await submitExam(true);
//               }
//             }
//           } else {
//             // fallback: server didn't return session (maybe unauthorized)
//             // attempt to restore from localStorage or create a new local start time
//             const savedStart = localStorage.getItem(`exam-${examId}-startTime`);
//             const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);

//             if (!cancelled) {
//               if (savedStart) {
//                 const parsed = parseInt(savedStart, 10);
//                 setStartTime(parsed);
//               } else {
//                 const now = Date.now();
//                 setStartTime(now);
//                 localStorage.setItem(
//                   `exam-${examId}-startTime`,
//                   now.toString()
//                 );
//                 // attempt to create session on backend (best-effort)
//                 try {
//                   await fetch(`/api/exams/${examId}/session`, {
//                     method: "POST",
//                   });
//                 } catch (e) {
//                   // ignore create failure (could be auth)
//                 }
//               }

//               if (savedAnswers) {
//                 try {
//                   const parsedAnswers = JSON.parse(savedAnswers);
//                   setAnswers(parsedAnswers);
//                 } catch {
//                   setAnswers({});
//                 }
//               }
//             }
//           }
//         } catch (sessErr) {
//           console.warn("Session create/restore failed:", sessErr);
//           // fallback to local storage if session POST fails
//           const savedStart = localStorage.getItem(`exam-${examId}-startTime`);
//           const savedAnswers = localStorage.getItem(`exam-${examId}-answers`);
//           if (!cancelled) {
//             if (savedStart) setStartTime(parseInt(savedStart, 10));
//             else {
//               const now = Date.now();
//               setStartTime(now);
//               localStorage.setItem(`exam-${examId}-startTime`, now.toString());
//             }
//             if (savedAnswers) {
//               try {
//                 setAnswers(JSON.parse(savedAnswers));
//               } catch {
//                 setAnswers({});
//               }
//             }
//           }
//         }
//       } catch (err) {
//         console.error("Init failed:", err);
//         if (!cancelled) router.push("/studentDashboard");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     init();

//     const handleContextMenu = (e: MouseEvent) => e.preventDefault();
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(e.key)) {
//         e.preventDefault();
//       }
//     };

//     document.addEventListener("contextmenu", handleContextMenu);
//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       cancelled = true;
//       document.removeEventListener("contextmenu", handleContextMenu);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//     // note: submitExam included intentionally later if needed; not added to deps to avoid effect churn
//   }, [examId, router]);

//   // ----------------------------
//   // Handle Answer Selection
//   // ----------------------------
//   const handleAnswerSelect = (questionId: string, optionIndex: number) => {
//     if (submitted) return; // no edits after submit
//     setAnswers((prev) => {
//       const newAnswers = { ...prev, [questionId]: optionIndex };
//       // persist locally immediately
//       localStorage.setItem(
//         `exam-${examId}-answers`,
//         JSON.stringify(newAnswers)
//       );
//       return newAnswers;
//     });
//   };

//   // ----------------------------
//   // Autosave to Server (every 15s)
//   // ----------------------------
//   useEffect(() => {
//     if (submitted) return; // stop autosave once submitted

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
//         // if backend indicates already submitted, lock UI
//         if (
//           !data.success &&
//           data.message?.toLowerCase().includes("submitted")
//         ) {
//           setSubmitted(true);
//         }
//       } catch (err) {
//         console.warn("Autosave failed:", err);
//       }
//     }, 15000);

//     return () => clearInterval(interval);
//   }, [answers, examId, exam, startTime, submitted]);

//   // ----------------------------
//   // Helpers / UI actions
//   // ----------------------------
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
//   // Render
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
//         <p className="text-gray-500 text-lg">
//           Exam not found or no questions available.
//         </p>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Timer */}
//       {!submitted && (
//         <Timer
//           expiryTimestamp={getExpiryTime()}
//           onExpire={handleTimeExpire}
//           autoSubmit={true}
//         />
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
//                 style={{
//                   width: `${(getAnsweredCount() / questions.length) * 100}%`,
//                 }}
//               />
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
//                   <p className="text-lg font-medium text-gray-900">
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
//                     disabled={submitted}
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
//                       <div className="w-2 h-2 bg-white rounded-full" />
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
//                   setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
//                 }
//                 disabled={currentQuestionIndex === 0 || submitted}
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
//                   disabled={
//                     currentQuestionIndex === questions.length - 1 || submitted
//                   }
//                 >
//                   Next
//                 </Button>
//                 {!submitted && (
//                   <Button
//                     variant="danger"
//                     onClick={handleSubmitClick}
//                     loading={submitting}
//                   >
//                     Submit Exam
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {questions.map((q, index) => (
//             <button
//               key={q._id}
//               onClick={() => !submitted && setCurrentQuestionIndex(index)}
//               className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
//                 index === currentQuestionIndex
//                   ? "bg-blue-600 text-white"
//                   : answers[q._id] !== undefined
//                   ? "bg-green-100 text-green-800 border border-green-300"
//                   : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
//               }`}
//               disabled={submitted}
//             >
//               {index + 1}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Submit Confirmation Modal */}
//       {showSubmitConfirm && !submitted && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <h3 className="text-xl font-bold text-gray-900 mb-4">
//               Confirm Submission
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to submit your exam? You have answered{" "}
//               {getAnsweredCount()} out of {questions.length} questions.
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
