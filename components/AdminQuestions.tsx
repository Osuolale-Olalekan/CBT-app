// app/admin/questions/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctOption: number;
  department?: string;
  subject?: string;
  difficulty?: string;
}

const departments = ["Science", "Art", "Commercial", "General"] as const;
const difficulties = ["Easy", "Medium", "Hard"] as const;

const AdminQuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState<Question | null>(null);
  const [creating, setCreating] = useState(false);

  const emptyForm = {
    text: "",
    options: ["", "", ""],
    correctOption: 0,
    department: "",
    subject: "",
    difficulty: "Medium",
  };

  const [form, setForm] = useState({ ...emptyForm });

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/questions");
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      } else {
        setError(data.message || "Failed to load questions");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while fetching questions");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const addOption = () => {
    if (form.options.length < 6) {
      setForm({ ...form, options: [...form.options, ""] });
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => [data.question, ...prev]);
        setCreating(false);
        setForm({ ...emptyForm });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (question: Question) => {
    setEditing(question);
    setForm({
      text: question.text,
      options: [...question.options],
      correctOption: question.correctOption,
      department: question.department || "",
      subject: question.subject || "",
      difficulty: question.difficulty || "Medium",
    });
  };

  const handleEditSubmit = async () => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/questions/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) => (q._id === editing._id ? data.question : q))
        );
        setEditing(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/questions/${deleting._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== deleting._id));
        setDeleting(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center py-10">Loading questions...</p>;
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

  // Reusable modal form
  const renderForm = (
  onSubmit: () => void,
  onCancel: () => void,
  title: string,
  submitText: string
) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-2 sm:px-4">
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        {title}
      </h2>

      {/* Question text */}
      <textarea
        className="w-full border rounded-lg p-3 mb-4 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        placeholder="Enter question text"
        rows={3}
      />

      {/* Options */}
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Options
      </label>
      {form.options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <input
            className="flex-1 border rounded-lg p-2 dark:bg-gray-800 dark:text-gray-200"
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
          />
          <input
            type="radio"
            checked={form.correctOption === i}
            onChange={() => setForm({ ...form, correctOption: i })}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Correct</span>
        </div>
      ))}
      {form.options.length < 6 && (
        <button
          onClick={addOption}
          className="text-blue-600 text-sm font-medium hover:underline mb-4"
        >
          + Add Option
        </button>
      )}

      {/* Department */}
      <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
        Department
      </label>
      <select
        className="w-full border p-2 rounded-lg mb-4 dark:bg-gray-800 dark:text-gray-200"
        value={form.department}
        onChange={(e) => setForm({ ...form, department: e.target.value })}
      >
        <option value="">Select department</option>
        {departments.map((dep) => (
          <option key={dep} value={dep}>
            {dep}
          </option>
        ))}
      </select>

      {/* Subject */}
      <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
        Subject
      </label>
      <input
        className="w-full border rounded-lg p-2 mb-4 dark:bg-gray-800 dark:text-gray-200"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        placeholder="Enter subject"
      />

      {/* Difficulty */}
      <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
        Difficulty
      </label>
      <select
        className="w-full border p-2 rounded-lg mb-4 dark:bg-gray-800 dark:text-gray-200"
        value={form.difficulty}
        onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
      >
        {difficulties.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {submitText}
        </button>
      </div>
    </div>
  </div>
);


  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Questions</h1>
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            onClick={() => {
              setForm({ ...emptyForm });
              setCreating(true);
            }}
          >
            + Add New Question
          </button>
          <Link
            href={"/admin/questions/bulkUploads"}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Upload Bulk Questions
          </Link>
        </div>
      </div>

      {/* Table wrapper for responsiveness */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-3">Text</th>
              <th className="p-3">Options</th>
              <th className="p-3">Answer</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Difficulty</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr
                key={q._id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="p-3">{q.text}</td>
                <td className="p-3">
                  {q.options.map((opt, idx) => (
                    <div key={idx}>
                      {idx + 1}. {opt}
                    </div>
                  ))}
                </td>
                <td className="p-3 text-green-600 font-semibold">
                  {q.options[q.correctOption]}
                </td>
                <td className="p-3">{q.subject || "-"}</td>
                <td className="p-3">{q.difficulty || "-"}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEditModal(q)}
                    className="px-3 py-1 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleting(q)}
                    className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {creating &&
        renderForm(handleCreateSubmit, () => setCreating(false), "Add New Question", "Create")}

      {/* Edit Modal */}
      {editing &&
        renderForm(handleEditSubmit, () => setEditing(null), "Edit Question", "Save")}

      {/* Delete Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{deleting.text}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionsPage;
