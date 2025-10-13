// app/profile/page.tsx
import { getUserWithId, logout, verifyUser } from "@/lib/user-action";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
  const auth = await verifyUser();
  if (!auth.success) redirect("/login");

  const user = await getUserWithId(auth.id as string);
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md md:max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-blue-500 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-800">
            {user.name || "User Name"}
          </h1>
          <p className="text-gray-500">{user.email}</p>
        </div>

        {/* Profile Info */}
        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-medium">Email</span>
            <span className="text-gray-600">{user.email}</span>
          </div>
          {user.role && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-medium">Role</span>
              <span className="capitalize text-blue-600">{user.role}</span>
            </div>
          )}
          {user.department && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="font-medium">Department</span>
              <span className="text-gray-600">{user.department}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <form action={logout} className="flex-1">
            <button
              type="submit"
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 cursor-pointer"
            >
              Logout
            </button>
          </form>

          <Link
            href="/studentDashboard"
            className="w-full sm:w-auto flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center rounded-lg transition-all duration-200"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          © {new Date().getFullYear()} God`s Way CBT Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Page;
