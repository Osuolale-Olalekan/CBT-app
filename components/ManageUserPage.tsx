"use client";

import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  department?: string;
}

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editUser, setEditUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  // filters
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterDept, setFilterDept] = useState<string>("");

  // ✅ Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
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

  // ✅ Delete user
  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
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

  // ✅ Save user edits
  const saveUser = async () => {
    if (!editUser) return;

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
    }
  };

  // ✅ Apply filters
  const filteredUsers = users.filter((u) => {
    return (
      (filterRole ? u.role === filterRole : true) &&
      (filterDept ? u.department === filterDept : true)
    );
  });

  if (loading) return <p className="text-center py-10">Loading users...</p>;
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Users</h1>

      {/* ✅ Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full sm:w-48 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="w-full sm:w-48 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Departments</option>
          <option value="Art">Art</option>
          <option value="Commercial">Commercial</option>
          <option value="Science">Science</option>
        </select>

        <button
          onClick={() => {
            setFilterRole("");
            setFilterDept("");
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 border">Name</th>
              <th className="px-4 py-3 border">Email</th>
              <th className="px-4 py-3 border">Role</th>
              <th className="px-4 py-3 border">Department</th>
              <th className="px-4 py-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 py-3 border font-medium text-gray-900">
                  {u.name}
                </td>
                <td className="px-4 py-3 border text-gray-600">{u.email}</td>
                <td className="px-4 py-3 border capitalize">{u.role}</td>
                <td className="px-4 py-3 border">{u.department || "-"}</td>
                <td className="px-4 py-3 border text-center space-x-2">
                  <button
                    onClick={() => {
                      setEditUser(u);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Edit Modal */}
      {showModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 sm:w-96 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Edit User</h2>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
              className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
              className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={editUser.role}
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value as User["role"] })
              }
              className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <label className="block mb-2 text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              value={editUser.department || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, department: e.target.value })
              }
              className="w-full p-2 border rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Department</option>
              <option value="Art">Art</option>
              <option value="Commercial">Commercial</option>
              <option value="Science">Science</option>
            </select>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveUser}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
