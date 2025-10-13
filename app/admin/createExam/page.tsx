"use client";

import React, { useEffect, useState } from "react";
import { Clock, Target } from "lucide-react"; // ✅ icons

// ✅ Define Question type
interface Question {
  _id: string;
  text: string;
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  department: "Science" | "Art" | "Commercial" | "General";
}

// ✅ Define ExamForm type
interface ExamForm {
  title: string;
  description: string;
  duration: number;
  department: "Science" | "Art" | "Commercial";
  questions: string[];
  passingScore: number;
}

const CreateExamPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<ExamForm>({
    title: "",
    description: "",
    duration: 10,
    department: "Science",
    questions: [],
    passingScore: 50,
  });

  // ✅ Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoadingQuestions(true);
        const res = await fetch("/api/questions");
        const data = await res.json();
        if (data.success) setQuestions(data.questions);
      } catch (error) {
        console.error("❌ Failed to fetch questions", error);
      } finally {
        setLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, []);

  // ✅ Handle input change
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "passingScore" ? Number(value) : value,
    }));
  }

  // ✅ Toggle question selection
  function toggleQuestion(id: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      questions: checked
        ? [...prev.questions, id]
        : prev.questions.filter((qid) => qid !== id),
    }));
  }

  // ✅ Submit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Exam created successfully!");
        setForm({
          title: "",
          description: "",
          duration: 30,
          department: "Science",
          questions: [],
          passingScore: 50,
        });
      } else {
        alert("❌ " + (data.message || "Failed to create exam"));
      }
    } catch (error) {
      console.error("Error creating exam:", error);
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ Spinner Component
  const Spinner = () => (
    <div className="flex justify-center items-center space-x-2 text-gray-600">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span>Loading...</span>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Exam</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow-lg rounded-xl p-6"
      >
        {/* Exam Title */}
        <div>
          <label className="block font-semibold mb-1">Exam Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter exam title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            placeholder="Enter exam description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
            rows={3}
          />
        </div>

        {/* Duration & Passing Score (Side by Side on big screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" /> Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
              min={1}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" /> Passing Score (%)
            </label>
            <input
              type="number"
              name="passingScore"
              value={form.passingScore}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
              min={1}
              max={100}
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block font-semibold mb-1">Department</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          >
            <option value="Science">Science</option>
            <option value="Art">Art</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        {/* Questions */}
        <div>
          <h2 className="font-semibold mb-2">Select Questions</h2>
          <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
            {loadingQuestions ? (
              <Spinner />
            ) : questions.length === 0 ? (
              <p className="text-gray-500">No questions available.</p>
            ) : (
              questions.map((q) => (
                <label
                  key={q._id}
                  className="flex items-center space-x-2 bg-gray-50 p-2 rounded hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={form.questions.includes(q._id)}
                    onChange={(e) => toggleQuestion(q._id, e.target.checked)}
                    disabled={submitting}
                  />
                  <span className="text-sm">
                    <span className="font-medium">{q.text}</span>{" "}
                    <span className="text-gray-500">
                      ({q.subject}, {q.difficulty})
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition hover:bg-blue-700 ${
            submitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={submitting}
        >
          {submitting && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{submitting ? "Creating Exam..." : "Create Exam"}</span>
        </button>
      </form>
    </div>
  );
};

export default CreateExamPage;
