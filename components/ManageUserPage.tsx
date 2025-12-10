// "use client";

// import React, { useEffect, useState } from "react";

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: "student" | "admin";
//   department?: string;
// }

// const ManageUsersPage: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [editUser, setEditUser] = useState<User | null>(null);
//   const [showModal, setShowModal] = useState(false);

//   // filters
//   const [filterRole, setFilterRole] = useState<string>("");
//   const [filterDept, setFilterDept] = useState<string>("");

//   // ✅ Fetch all users
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/users");
//       const data = await res.json();
//       if (data.success) {
//         setUsers(data.users);
//       } else {
//         setError(data.message || "Failed to load users");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Server error while fetching users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Delete user
//   const deleteUser = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this user?")) return;
//     try {
//       const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (data.success) {
//         setUsers((prev) => prev.filter((u) => u._id !== id));
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ✅ Save user edits
//   const saveUser = async () => {
//     if (!editUser) return;

//     try {
//       const res = await fetch(`/api/users/${editUser._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(editUser),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setUsers((prev) =>
//           prev.map((u) => (u._id === editUser._id ? data.user : u))
//         );
//         setShowModal(false);
//       } else {
//         alert(data.message);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ✅ Apply filters
//   const filteredUsers = users.filter((u) => {
//     return (
//       (filterRole ? u.role === filterRole : true) &&
//       (filterDept ? u.department === filterDept : true)
//     );
//   });

//   if (loading) return <p className="text-center py-10">Loading users...</p>;
//   if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

//   return (
//     <div className="container mx-auto px-4 md:px-8 py-8">
//       <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Users</h1>

//       {/* ✅ Filter Bar */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-6">
//         <select
//           value={filterRole}
//           onChange={(e) => setFilterRole(e.target.value)}
//           className="w-full sm:w-48 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//         >
//           <option value="">All Roles</option>
//           <option value="student">Student</option>
//           <option value="admin">Admin</option>
//         </select>

//         <select
//           value={filterDept}
//           onChange={(e) => setFilterDept(e.target.value)}
//           className="w-full sm:w-48 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//         >
//           <option value="">All Departments</option>
//           <option value="Art">Art</option>
//           <option value="Commercial">Commercial</option>
//           <option value="Science">Science</option>
//         </select>

//         <button
//           onClick={() => {
//             setFilterRole("");
//             setFilterDept("");
//           }}
//           className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
//         >
//           Reset
//         </button>
//       </div>

//       <div className="overflow-x-auto rounded-lg shadow-md">
//         <table className="w-full text-sm text-left border-collapse">
//           <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
//             <tr>
//               <th className="px-4 py-3 border">Name</th>
//               <th className="px-4 py-3 border">Email</th>
//               <th className="px-4 py-3 border">Role</th>
//               <th className="px-4 py-3 border">Department</th>
//               <th className="px-4 py-3 border text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredUsers.map((u) => (
//               <tr
//                 key={u._id}
//                 className="hover:bg-gray-50 transition-colors duration-150"
//               >
//                 <td className="px-4 py-3 border font-medium text-gray-900">
//                   {u.name}
//                 </td>
//                 <td className="px-4 py-3 border text-gray-600">{u.email}</td>
//                 <td className="px-4 py-3 border capitalize">{u.role}</td>
//                 <td className="px-4 py-3 border">{u.department || "-"}</td>
//                 <td className="px-4 py-3 border text-center space-x-2">
//                   <button
//                     onClick={() => {
//                       setEditUser(u);
//                       setShowModal(true);
//                     }}
//                     className="px-3 py-1 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => deleteUser(u._id)}
//                     className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* ✅ Edit Modal */}
//       {showModal && editUser && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 sm:w-96 animate-fade-in">
//             <h2 className="text-xl font-bold mb-4 text-gray-800">Edit User</h2>

//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               value={editUser.name}
//               onChange={(e) =>
//                 setEditUser({ ...editUser, name: e.target.value })
//               }
//               className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
//             />

//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               value={editUser.email}
//               onChange={(e) =>
//                 setEditUser({ ...editUser, email: e.target.value })
//               }
//               className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
//             />

//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Role
//             </label>
//             <select
//               value={editUser.role}
//               onChange={(e) =>
//                 setEditUser({ ...editUser, role: e.target.value as User["role"] })
//               }
//               className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
//             >
//               <option value="student">Student</option>
//               <option value="admin">Admin</option>
//             </select>

//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Department
//             </label>
//             <select
//               value={editUser.department || ""}
//               onChange={(e) =>
//                 setEditUser({ ...editUser, department: e.target.value })
//               }
//               className="w-full p-2 border rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
//             >
//               <option value="">Select Department</option>
//               <option value="Art">Art</option>
//               <option value="Commercial">Commercial</option>
//               <option value="Science">Science</option>
//             </select>

//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={saveUser}
//                 className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageUsersPage;






//DESIGN DONE WITH AI BELOW FOR BETTER VIEW JUST DESIGN O LOL
// components/admin/ManageUsersPage.tsx (or app/admin/users/page.tsx)
"use client";

import React, { useEffect, useState } from "react";
import { Users, Filter, XCircle, Edit, Trash2, Save, X, RotateCw, AlertTriangle, Loader2 } from "lucide-react"; // Import Lucide Icons

// Interface definitions remain the same
interface User {
    _id: string;
    name: string;
    email: string;
    role: "student" | "admin";
    department?: string;
}

// Custom Modal Component for better organization and styling
interface EditModalProps {
    user: User;
    onSave: () => void;
    onClose: () => void;
    onChange: (field: keyof User, value: string | undefined) => void;
}

const EditUserModal: React.FC<EditModalProps> = ({ user, onSave, onClose, onChange }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-11/12 sm:w-96 transform scale-100 transition-transform duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-600" /> Edit User
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4">
                <InputGroup label="Name" value={user.name} onChange={(e) => onChange("name", e.target.value)} type="text" />
                <InputGroup label="Email" value={user.email} onChange={(e) => onChange("email", e.target.value)} type="email" />
                
                <SelectGroup 
                    label="Role" 
                    value={user.role} 
                    onChange={(e) => onChange("role", e.target.value as User["role"])}
                    options={[
                        { value: "student", label: "Student" },
                        { value: "admin", label: "Admin" }
                    ]}
                />

                <SelectGroup 
                    label="Department" 
                    value={user.department || ""} 
                    onChange={(e) => onChange("department", e.target.value)}
                    options={[
                        { value: "", label: "Select Department" },
                        { value: "Art", label: "Art" },
                        { value: "Commercial", label: "Commercial" },
                        { value: "Science", label: "Science" }
                    ]}
                />
            </div>

            <div className="flex justify-end space-x-3 mt-8">
                <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md shadow-blue-500/30 flex items-center gap-1"
                >
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>
        </div>
    </div>
);

// Helper for Input Group
const InputGroup: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type: string; }> = ({ label, value, onChange, type }) => (
    <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
    </div>
);

// Helper for Select Group
const SelectGroup: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string, label: string }[]; }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

// Main Component
const ManageUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editUser, setEditUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    // Filters
    const [filterRole, setFilterRole] = useState<string>("");
    const [filterDept, setFilterDept] = useState<string>("");

    // Fetch all users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/users");
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                setError(data.message || "Failed to load users");
            }
        } catch (err) {
            console.error(err);
            setError("Server error while fetching users");
        } finally {
            setLoading(false);
        }
    };

    // Delete user
    const deleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setUsers((prev) => prev.filter((u) => u._id !== id));
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Save user edits
    const saveUser = async () => {
        if (!editUser) return;
        setLoading(true); // Show loading while saving
        try {
            const res = await fetch(`/api/users/${editUser._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editUser),
            });
            const data = await res.json();
            if (data.success) {
                setUsers((prev) =>
                    prev.map((u) => (u._id === editUser._id ? data.user : u))
                );
                setShowModal(false);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving user.");
        } finally {
            setLoading(false);
        }
    };

    const handleModalChange = (field: keyof User, value: string | undefined) => {
        if (editUser) {
            setEditUser({ ...editUser, [field]: value });
        }
    };

    // Apply filters
    const filteredUsers = users.filter((u) => {
        return (
            (filterRole ? u.role === filterRole : true) &&
            (filterDept ? u.department === filterDept : true)
        );
    });

    // --- Render States ---

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                <p className="text-lg">Loading user data...</p>
            </div>
        );
    }
    
    // Only show error message if there's no data to display
    if (error && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 border-l-4 border-red-500 p-8">
                <AlertTriangle className="w-10 h-10 mb-3" />
                <p className="text-xl font-semibold">Error Loading Data</p>
                <p className="text-center mt-2">{error}</p>
                <button
                    onClick={fetchUsers}
                    className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                    <RotateCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Header */}
            <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="w-7 h-7 text-blue-600" /> Manage Users
                </h1>
                <p className="text-gray-500 mt-1">View and manage all user accounts in the system.</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Filter className="w-5 h-5" /> Filters:
                </div>
                
                {/* Role Filter */}
                <SelectGroup 
                    label=""
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    options={[
                        { value: "", label: "All Roles" },
                        { value: "student", label: "Student" },
                        { value: "admin", label: "Admin" }
                    ]}
                />

                {/* Department Filter */}
                <SelectGroup 
                    label=""
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    options={[
                        { value: "", label: "All Departments" },
                        { value: "Art", label: "Art" },
                        { value: "Commercial", label: "Commercial" },
                        { value: "Science", label: "Science" }
                    ]}
                />

                {/* Reset Button */}
                <button
                    onClick={() => {
                        setFilterRole("");
                        setFilterDept("");
                    }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium w-full md:w-auto flex items-center justify-center gap-1"
                >
                    <XCircle className="w-4 h-4" /> Reset Filters
                </button>
            </div>

            {/* User Table */}
            <div className="bg-white overflow-hidden rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left divide-y divide-gray-200">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Name</th>
                                <th className="px-6 py-3 font-semibold">Email</th>
                                <th className="px-6 py-3 font-semibold">Role</th>
                                <th className="px-6 py-3 font-semibold">Department</th>
                                <th className="px-6 py-3 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <tr
                                        key={u._id}
                                        className="hover:bg-blue-50 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            {u.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                        <td className={`px-6 py-4 capitalize font-semibold ${u.role === 'admin' ? 'text-red-500' : 'text-blue-500'}`}>
                                            {u.role}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{u.department || "-"}</td>
                                        <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                                            <button
                                                onClick={() => {
                                                    setEditUser(u);
                                                    setShowModal(true);
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition flex items-center justify-center gap-1 inline-flex text-xs font-medium"
                                                aria-label={`Edit ${u.name}`}
                                            >
                                                <Edit className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                onClick={() => deleteUser(u._id)}
                                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-1 inline-flex text-xs font-medium"
                                                aria-label={`Delete ${u.name}`}
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-lg text-gray-500">
                                        No users found matching the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal (Conditional Rendering) */}
            {showModal && editUser && (
                <EditUserModal 
                    user={editUser}
                    onSave={saveUser}
                    onClose={() => setShowModal(false)}
                    onChange={handleModalChange}
                />
            )}
        </div>
    );
};

export default ManageUsersPage;