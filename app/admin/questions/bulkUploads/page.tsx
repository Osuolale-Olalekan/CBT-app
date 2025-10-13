"use client";

import React, { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from "lucide-react";

export default function BulkUploadQuestionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setError("");
    setMessage("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/questions/bulk", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setMessage(`✅ ${data.message}`);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Download sample CSV
  const handleDownloadSampleCSV = () => {
    const sampleData = [
      ["text", "options", "correctOption", "department", "subject", "difficulty"],
      ["What is 2 + 2?", "['2','3','4','5']", "2", "Science", "Math", "Easy"],
      ["Who wrote Hamlet?", "['Shakespeare','Achebe','Tolkien','Orwell']", "0", "Art", "Literature", "Medium"],
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-questions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      {/* Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Upload className="w-7 h-7 text-blue-600" /> Bulk Upload Questions
        </h1>
        <p className="text-gray-600 mb-6">
          Upload a <strong>CSV</strong> or <strong>JSON</strong> file containing multiple questions.
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            <li>JSON: array of question objects</li>
            <li>CSV: must include columns <code className="bg-gray-100 px-1 rounded">text, options, correctOption, department, subject, difficulty</code></li>
          </ul>
        </div>

        {/* CSV column guide */}
        <div className="overflow-x-auto border rounded-lg mb-6">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b">Column</th>
                <th className="px-4 py-2 border-b">Description</th>
                <th className="px-4 py-2 border-b">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border-b font-medium">text</td>
                <td className="px-4 py-2 border-b">The question text</td>
                <td className="px-4 py-2 border-b">What is 2 + 2?</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b font-medium">options</td>
                <td className="px-4 py-2 border-b">Array of 4 possible answers</td>
                <td className="px-4 py-2 border-b">[`2`,`3`,`4`,`5`]</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b font-medium">correctOption</td>
                <td className="px-4 py-2 border-b">Index (0–3) of correct answer</td>
                <td className="px-4 py-2 border-b">2</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b font-medium">department</td>
                <td className="px-4 py-2 border-b">Which department this belongs to</td>
                <td className="px-4 py-2 border-b">Science</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b font-medium">subject</td>
                <td className="px-4 py-2 border-b">Subject of the question</td>
                <td className="px-4 py-2 border-b">Math</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b font-medium">difficulty</td>
                <td className="px-4 py-2 border-b">Easy / Medium / Hard</td>
                <td className="px-4 py-2 border-b">Medium</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-5">
          <button
            onClick={handleDownloadSampleCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm"
          >
            <Download className="w-4 h-4" /> Download Sample CSV
          </button>

          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-400 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
              <FileSpreadsheet className="w-5 h-5 text-gray-600" />
              {file ? file.name : "Choose a file..."}
            </div>
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" /> Upload File
            </>
          )}
        </button>

        {/* Messages */}
        {message && (
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" /> {message}
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
      </div>
    </div>
  );
}
