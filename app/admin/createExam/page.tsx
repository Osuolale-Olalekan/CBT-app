//THIS IS WORKING PERFECTLY AND I MAY REVERT TO THIS, I ONLY CHANGED IT TO THE ONE BELOW USING AI DESIGN ONLY
// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import { Clock, Target } from "lucide-react";

// interface Question {
//   _id: string;
//   text: string;
//   subject: string;
//   difficulty: "Easy" | "Medium" | "Hard";
//   department: "JSS 1" | "JSS 2" | "JSS 3" | "General";
// }

// interface ExamForm {
//   title: string;
//   description: string;
//   duration: number;
//   department: "JSS 1" | "JSS 2" | "JSS 3";
//   questions: string[];
//   passingScore: number;
// }

// const CreateExamPage: React.FC = () => {
//   const [allQuestions, setAllQuestions] = useState<Question[]>([]);
//   const [loadingQuestions, setLoadingQuestions] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [form, setForm] = useState<ExamForm>({
//     title: "",
//     description: "",
//     duration: 10,
//     department: "JSS 3",
//     questions: [],
//     passingScore: 50,
//   });

//   // ✅ Fetch all questions once
//   useEffect(() => {
//     async function fetchQuestions() {
//       try {
//         setLoadingQuestions(true);
//         const res = await fetch("/api/questions");
//         const data = await res.json();
//         if (data.success) setAllQuestions(data.questions);
//       } catch (error) {
//         console.error("❌ Failed to fetch questions", error);
//       } finally {
//         setLoadingQuestions(false);
//       }
//     }
//     fetchQuestions();
//   }, []);

//   // ✅ Filter questions based on selected department
//   const filteredQuestions = useMemo(() => {
//     return allQuestions.filter(
//       (q) => q.department === form.department || q.department === "General"
//     );
//   }, [allQuestions, form.department]);

//   // ✅ Clear selected questions when department changes
//   useEffect(() => {
//     setForm((prev) => ({
//       ...prev,
//       questions: prev.questions.filter((qId) =>
//         filteredQuestions.some((q) => q._id === qId)
//       ),
//     }));
//   }, [form.department, filteredQuestions]);

//   // ✅ Handle input change
//   function handleChange(
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) {
//     const { name, value } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]:
//         name === "duration" || name === "passingScore" ? Number(value) : value,
//     }));
//   }

//   // ✅ Toggle question selection
//   function toggleQuestion(id: string, checked: boolean) {
//     setForm((prev) => ({
//       ...prev,
//       questions: checked
//         ? [...prev.questions, id]
//         : prev.questions.filter((qid) => qid !== id),
//     }));
//   }

//   // ✅ Submit form
//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("/api/exams", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (data.success) {
//         alert("✅ Exam created successfully!");
//         setForm({
//           title: "",
//           description: "",
//           duration: 30,
//           department: "JSS 3",
//           questions: [],
//           passingScore: 50,
//         });
//       } else {
//         alert("❌ " + (data.message || "Failed to create exam"));
//       }
//     } catch (error) {
//       console.error("Error creating exam:", error);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   // ✅ Spinner Component
//   const Spinner = () => (
//     <div className="flex justify-center items-center space-x-2 text-gray-600">
//       <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       <span>Loading...</span>
//     </div>
//   );

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-center">Create New Exam</h1>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-6 bg-white shadow-lg rounded-xl p-6"
//       >
//         {/* Exam Title */}
//         <div>
//           <label className="block font-semibold mb-1">Exam Title</label>
//           <input
//             type="text"
//             name="title"
//             placeholder="Enter exam title"
//             value={form.title}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             disabled={submitting}
//           />
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block font-semibold mb-1">Description</label>
//           <textarea
//             name="description"
//             placeholder="Enter exam description"
//             value={form.description}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             disabled={submitting}
//             rows={3}
//           />
//         </div>

//         {/* Duration & Passing Score */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block font-semibold mb-1 flex items-center gap-2">
//               <Clock className="w-4 h-4 text-gray-500" /> Duration (minutes)
//             </label>
//             <input
//               type="number"
//               name="duration"
//               value={form.duration}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               disabled={submitting}
//               min={1}
//             />
//           </div>

//           <div>
//             <label className="block font-semibold mb-1 flex items-center gap-2">
//               <Target className="w-4 h-4 text-gray-500" /> Passing Score (%)
//             </label>
//             <input
//               type="number"
//               name="passingScore"
//               value={form.passingScore}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               disabled={submitting}
//               min={1}
//               max={100}
//             />
//           </div>
//         </div>

//         {/* Department */}
//         <div>
//           <label className="block font-semibold mb-1">Department</label>
//           <select
//             name="department"
//             value={form.department}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             disabled={submitting}
//           >
//             <option value="JSS 1">JSS 1</option>
//             <option value="JSS 2">JSS 2</option>
//             <option value="JSS 3">JSS 3</option>
//           </select>
//         </div>

//         {/* Questions */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <h2 className="font-semibold">Select Questions</h2>
//             <span className="text-sm text-gray-500">
//               {filteredQuestions.length} questions available for {form.department}
//             </span>
//           </div>
//           <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
//             {loadingQuestions ? (
//               <Spinner />
//             ) : filteredQuestions.length === 0 ? (
//               <p className="text-gray-500">
//                 No questions available for {form.department}. Questions marked as General will appear for all departments.
//               </p>
//             ) : (
//               filteredQuestions.map((q) => (
//                 <label
//                   key={q._id}
//                   className="flex items-start space-x-2 bg-gray-50 p-2 rounded hover:bg-gray-100"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={form.questions.includes(q._id)}
//                     onChange={(e) => toggleQuestion(q._id, e.target.checked)}
//                     disabled={submitting}
//                     className="mt-1"
//                   />
//                   <div className="flex-1">
//                     <div className="text-sm font-medium">{q.text}</div>
//                     <div className="text-xs text-gray-500 mt-1">
//                       <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-1">
//                         {q.subject}
//                       </span>
//                       <span className="inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded mr-1">
//                         {q.difficulty}
//                       </span>
//                       <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded">
//                         {q.department}
//                       </span>
//                     </div>
//                   </div>
//                 </label>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition hover:bg-blue-700 ${
//             submitting ? "opacity-70 cursor-not-allowed" : ""
//           }`}
//           disabled={submitting}
//         >
//           {submitting && (
//             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//           )}
//           <span>{submitting ? "Creating Exam..." : "Create Exam"}</span>
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateExamPage;





//AI DESIGN FOR THIS PART, THE ABOVE IS WORKING FINE THOUGH
// components/admin/CreateExamPage.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Clock, Target, FilePlus, Zap, CheckSquare, Layers, Search, Loader2 } from "lucide-react";

// --- Interface Definitions (Kept for completeness) ---

interface Question {
    _id: string;
    text: string;
    subject: string;
    difficulty: "Easy" | "Medium" | "Hard";
    department: "JSS 1" | "JSS 2" | "JSS 3" | "General";
}

interface ExamForm {
    title: string;
    description: string;
    duration: number;
    department: "JSS 1" | "JSS 2" | "JSS 3";
    questions: string[];
    passingScore: number;
}

// --- Helper Components for Styling ---

interface StatPillProps {
    count: number;
    label: string;
    color: string;
    icon: React.ReactNode;
}

const StatPill: React.FC<StatPillProps> = ({ count, label, color, icon }) => (
    <div className={`p-4 rounded-xl shadow-md flex items-center justify-between ${color} text-white`}>
        <div className="flex items-center space-x-3">
            {icon}
            <div>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-sm font-medium opacity-80">{label}</p>
            </div>
        </div>
    </div>
);

// --- Main Component ---

const CreateExamPage: React.FC = () => {
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // New state for question filtering

    const [form, setForm] = useState<ExamForm>({
        title: "",
        description: "",
        duration: 30, // Default to a more realistic duration
        department: "JSS 3",
        questions: [],
        passingScore: 60, // Default to a higher passing score
    });

    // ✅ Fetch all questions once
    useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoadingQuestions(true);
                const res = await fetch("/api/questions");
                const data = await res.json();
                if (data.success) setAllQuestions(data.questions);
            } catch (error) {
                console.error("❌ Failed to fetch questions", error);
            } finally {
                setLoadingQuestions(false);
            }
        }
        fetchQuestions();
    }, []);

    // ✅ Filter questions based on selected department and search term
    const filteredQuestions = useMemo(() => {
        const deptFiltered = allQuestions.filter(
            (q) => q.department === form.department || q.department === "General"
        );

        if (!searchTerm) return deptFiltered;

        const lowerCaseSearch = searchTerm.toLowerCase();
        return deptFiltered.filter(
            (q) =>
                q.text.toLowerCase().includes(lowerCaseSearch) ||
                q.subject.toLowerCase().includes(lowerCaseSearch)
        );
    }, [allQuestions, form.department, searchTerm]);
    
    // Total possible marks based on selected questions (assuming 1 mark per question)
    const totalMarks = form.questions.length;

    // ✅ Clear selected questions when department changes (and apply only to questions that still exist)
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.filter((qId) =>
                filteredQuestions.some((q) => q._id === qId)
            ),
        }));
    }, [form.department, filteredQuestions]); // Note: dependency updated to use filteredQuestions

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
        if (form.questions.length === 0) {
            alert("Please select at least one question for the exam.");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/exams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Use Authorization header if required by API
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), 
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (data.success) {
                alert(`✅ Exam "${form.title}" created successfully!`);
                // Reset form state to initial values
                setForm({
                    title: "",
                    description: "",
                    duration: 30,
                    department: "JSS 3",
                    questions: [],
                    passingScore: 60,
                });
            } else {
                alert("❌ " + (data.message || "Failed to create exam"));
            }
        } catch (error) {
            console.error("Error creating exam:", error);
            alert("A network error occurred while creating the exam.");
        } finally {
            setSubmitting(false);
        }
    }

    // Determine difficulty label color
    const getDifficultyClass = (difficulty: Question['difficulty']) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-100 text-green-700';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-700';
            case 'Hard':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FilePlus className="w-7 h-7 text-blue-600" /> Create New Exam
                </h1>
                <p className="text-gray-500 mt-1">Define the parameters and select questions for a new Computer-Based Test (CBT).</p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Section 1: Exam Details */}
                <div className="bg-white shadow-xl rounded-xl p-8 space-y-6 border-t-8 border-blue-500">
                    <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-2"><Layers className="w-5 h-5 text-blue-500" /> Basic Information</h2>
                    
                    {/* Title */}
                    <InputGroup label="Exam Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Mid-Term Physics Assessment" disabled={submitting} />

                    {/* Description */}
                    <div className="col-span-2">
                        <label className="block font-semibold mb-2 text-gray-700">Description</label>
                        <textarea
                            name="description"
                            placeholder="Provide a brief description or instructions for the students."
                            value={form.description}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
                            disabled={submitting}
                            rows={3}
                        />
                    </div>

                    {/* Duration, Score & Department */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label="Duration (minutes)" name="duration" value={form.duration} onChange={handleChange} type="number" icon={<Clock className="w-4 h-4" />} min={1} disabled={submitting} />
                        <InputGroup label="Passing Score (%)" name="passingScore" value={form.passingScore} onChange={handleChange} type="number" icon={<Target className="w-4 h-4" />} min={1} max={100} disabled={submitting} />
                        
                        <div>
                            <label className="block font-semibold mb-2 text-gray-700">Target Department</label>
                            <select
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition text-gray-900"
                                disabled={submitting}
                            >
                                <option value="JSS 1">JSS 1</option>
                                <option value="JSS 2">JSS 2</option>
                                <option value="JSS 3">JSS 3</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Section 2: Question Selection */}
                <div className="bg-white shadow-xl rounded-xl p-8 space-y-6 border-t-8 border-indigo-500">
                    <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-2"><CheckSquare className="w-5 h-5 text-indigo-500" /> Question Selection</h2>
                    
                    {/* Status Pills */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatPill 
                            count={form.questions.length} 
                            label="Questions Selected" 
                            color="bg-indigo-600"
                            icon={<CheckSquare className="w-6 h-6" />}
                        />
                         <StatPill 
                            count={totalMarks} 
                            label="Total Marks (1/Q)" 
                            color="bg-purple-600"
                            icon={<Zap className="w-6 h-6" />}
                        />
                    </div>
                    
                    {/* Question List and Search */}
                    <div>
                        <div className="relative mb-3">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder={`Search ${form.department} or General questions...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 placeholder-gray-400"
                                disabled={submitting || loadingQuestions}
                            />
                        </div>

                        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                            {loadingQuestions ? (
                                <div className="flex justify-center items-center p-10 text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    Loading available questions...
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 bg-red-50 rounded-lg border border-red-200">
                                    No questions available for **{form.department}** matching your search.
                                </div>
                            ) : (
                                filteredQuestions.map((q) => (
                                    <label
                                        key={q._id}
                                        className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition ${
                                            form.questions.includes(q._id)
                                                ? 'bg-blue-100 border-l-4 border-blue-600'
                                                : 'bg-white hover:bg-gray-100 border'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.questions.includes(q._id)}
                                            onChange={(e) => toggleQuestion(q._id, e.target.checked)}
                                            disabled={submitting}
                                            className="mt-1.5 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 line-clamp-2">{q.text}</div>
                                            <div className="text-xs mt-1 flex flex-wrap gap-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    Subject: {q.subject}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyClass(q.difficulty)}`}>
                                                    {q.difficulty}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    Dept: {q.department}
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full bg-blue-600 text-white px-4 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg shadow-blue-500/30
                    ${submitting || form.questions.length === 0 ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-xl"}`}
                    disabled={submitting || form.questions.length === 0}
                >
                    {submitting && (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>{submitting ? "Creating Exam..." : `Create Exam (${form.questions.length} Questions)`}</span>
                </button>
            </form>
        </div>
    );
};

export default CreateExamPage;


// Helper component for uniform input styling
const InputGroup: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
    min?: number;
    max?: number;
    disabled: boolean;
}> = ({ label, name, value, onChange, placeholder, type = "text", icon, min, max, disabled }) => (
    <div>
        <label className="block font-semibold mb-2 text-gray-700 flex items-center gap-2">
            {icon} {label}
        </label>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
            disabled={disabled}
            min={min}
            max={max}
        />
    </div>
);


























//OLD

//THIS IS WORKING BUT I CHANGED THE QUESTION FILTERING TO WORK RESPONSIVELY IN RELATED TO DEPARTMENT FIELD SO RELEVANT QUESTIONS CAN BE LOADED
// "use client";

// import React, { useEffect, useState } from "react";
// import { Clock, Target } from "lucide-react"; // ✅ icons

// // ✅ Define Question type
// interface Question {
//   _id: string;
//   text: string;
//   subject: string;
//   difficulty: "Easy" | "Medium" | "Hard";
//   department: "JSS 1" | "JSS 2" | "JSS 3" | "General";
// }

// // ✅ Define ExamForm type
// interface ExamForm {
//   title: string;
//   description: string;
//   duration: number;
//   department: "JSS 1" | "JSS 2" | "JSS 3";
//   questions: string[];
//   passingScore: number;
// }

// const CreateExamPage: React.FC = () => {
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loadingQuestions, setLoadingQuestions] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [form, setForm] = useState<ExamForm>({
//     title: "",
//     description: "",
//     duration: 10,
//     department: "JSS 3",
//     questions: [],
//     passingScore: 50,
//   });

//   // ✅ Fetch questions
//   useEffect(() => {
//     async function fetchQuestions() {
//       try {
//         setLoadingQuestions(true);
//         const res = await fetch("/api/questions");
//         const data = await res.json();
//         if (data.success) setQuestions(data.questions);
//       } catch (error) {
//         console.error("❌ Failed to fetch questions", error);
//       } finally {
//         setLoadingQuestions(false);
//       }
//     }
//     fetchQuestions();
//   }, []);

//   // ✅ Handle input change
//   function handleChange(
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) {
//     const { name, value } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]:
//         name === "duration" || name === "passingScore" ? Number(value) : value,
//     }));
//   }

//   // ✅ Toggle question selection
//   function toggleQuestion(id: string, checked: boolean) {
//     setForm((prev) => ({
//       ...prev,
//       questions: checked
//         ? [...prev.questions, id]
//         : prev.questions.filter((qid) => qid !== id),
//     }));
//   }

//   // ✅ Submit form
//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("/api/exams", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (data.success) {
//         alert("✅ Exam created successfully!");
//         setForm({
//           title: "",
//           description: "",
//           duration: 30,
//           department: "JSS 3",
//           questions: [],
//           passingScore: 50,
//         });
//       } else {
//         alert("❌ " + (data.message || "Failed to create exam"));
//       }
//     } catch (error) {
//       console.error("Error creating exam:", error);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   // ✅ Spinner Component
//   const Spinner = () => (
//     <div className="flex justify-center items-center space-x-2 text-gray-600">
//       <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       <span>Loading...</span>
//     </div>
//   );

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-center">Create New Exam</h1>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-6 bg-white shadow-lg rounded-xl p-6"
//       >
//         {/* Exam Title */}
//         <div>
//           <label className="block font-semibold mb-1">Exam Title</label>
//           <input
//             type="text"
//             name="title"
//             placeholder="Enter exam title"
//             value={form.title}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             disabled={submitting}
//           />
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block font-semibold mb-1">Description</label>
//           <textarea
//             name="description"
//             placeholder="Enter exam description"
//             value={form.description}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             disabled={submitting}
//             rows={3}
//           />
//         </div>

//         {/* Duration & Passing Score (Side by Side on big screens) */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block font-semibold mb-1 flex items-center gap-2">
//               <Clock className="w-4 h-4 text-gray-500" /> Duration (minutes)
//             </label>
//             <input
//               type="number"
//               name="duration"
//               value={form.duration}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               disabled={submitting}
//               min={1}
//             />
//           </div>

//           <div>
//             <label className="block font-semibold mb-1 flex items-center gap-2">
//               <Target className="w-4 h-4 text-gray-500" /> Passing Score (%)
//             </label>
//             <input
//               type="number"
//               name="passingScore"
//               value={form.passingScore}
//               onChange={handleChange}
//               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               disabled={submitting}
//               min={1}
//               max={100}
//             />
//           </div>
//         </div>

//         {/* Department */}
//         <div>
//           <label className="block font-semibold mb-1">Department</label>
//           <select
//             name="department"
//             value={form.department}
//             onChange={handleChange}
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             disabled={submitting}
//           >
//             <option value="JSS 1">JSS 1</option>
//             <option value="JSS 2">JSS 2</option>
//             <option value="JSS 3">JSS 3</option>
//           </select>
//         </div>

//         {/* Questions */}
//         <div>
//           <h2 className="font-semibold mb-2">Select Questions</h2>
//           <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
//             {loadingQuestions ? (
//               <Spinner />
//             ) : questions.length === 0 ? (
//               <p className="text-gray-500">No questions available.</p>
//             ) : (
//               questions.map((q) => (
//                 <label
//                   key={q._id}
//                   className="flex items-center space-x-2 bg-gray-50 p-2 rounded hover:bg-gray-100"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={form.questions.includes(q._id)}
//                     onChange={(e) => toggleQuestion(q._id, e.target.checked)}
//                     disabled={submitting}
//                   />
//                   <span className="text-sm">
//                     <span className="font-medium">{q.text}</span>{" "}
//                     <span className="text-gray-500">
//                       ({q.subject}, {q.difficulty}, {q.department})
//                     </span>
//                   </span>
//                 </label>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition hover:bg-blue-700 ${
//             submitting ? "opacity-70 cursor-not-allowed" : ""
//           }`}
//           disabled={submitting}
//         >
//           {submitting && (
//             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//           )}
//           <span>{submitting ? "Creating Exam..." : "Create Exam"}</span>
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateExamPage;
