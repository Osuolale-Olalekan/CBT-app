"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const departments = ["Science", "Art", "Commercial", "General"] as const;
const difficulties = ["Easy", "Medium", "Hard"] as const;

export default function CreateQuestionPage() {
  const router = useRouter();

  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          options,
          correctOption,
          department,
          subject,
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create question");
      }

      setSuccess("Question created successfully!");
      setText("");
      setOptions(["", ""]);
      setCorrectOption(null);
      setDepartment("");
      setSubject("");
      setDifficulty("Medium");

      setTimeout(() => {
        router.push("/admin/questions"); // redirect to questions list
      }, 1200);
    } catch (err: unknown) {
        if (err instanceof Error)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

//   } catch (err: unknown) {
//   if (err instanceof Error) {
//     setError(err.message);
//   } else {
//     setError("An unexpected error occurred");
//   }
// }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create Question</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block font-medium">Question Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border rounded p-2"
            rows={3}
            required
          />
        </div>

        {/* Options */}
        <div>
          <label className="block font-medium mb-1">Options</label>
          {options.map((opt, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 border rounded p-2"
                placeholder={`Option ${index + 1}`}
                required
              />
              <input
                type="radio"
                name="correctOption"
                checked={correctOption === index}
                onChange={() => setCorrectOption(index)}
              />
              <span className="text-sm">Correct</span>
            </div>
          ))}
          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="text-blue-600 text-sm"
            >
              + Add Option
            </button>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block font-medium">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select department</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block font-medium">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter subject"
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block font-medium">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border rounded p-2"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Question"}
          </button>
        </div>
      </form>
    </div>
  );
}
