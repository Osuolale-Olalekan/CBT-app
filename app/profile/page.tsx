// // app/profile/page.tsx
// import { getUserWithId, logout, verifyUser } from "@/lib/user-action";
// import Link from "next/link";
// import { redirect } from "next/navigation";

// const Page = async () => {
//   const auth = await verifyUser();
//   if (!auth.success) redirect("/login");

//   const user = await getUserWithId(auth.id as string);
  
//   if (!user) redirect("/login");

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
//       <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md md:max-w-lg">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="w-24 h-24 mx-auto bg-blue-500 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md">
//             {user.name?.charAt(0).toUpperCase() || "U"}
//           </div>
//           <h1 className="mt-4 text-2xl font-semibold text-gray-800">
//             {user.name || "User Name"}
//           </h1>
//           <p className="text-gray-500">{user.email}</p>
//         </div>

//         {/* Profile Info */}
//         <div className="space-y-3 text-gray-700">
//           <div className="flex justify-between border-b border-gray-200 pb-2">
//             <span className="font-medium">Email</span>
//             <span className="text-gray-600">{user.email}</span>
//           </div>
//           {user.role && (
//             <div className="flex justify-between border-b border-gray-200 pb-2">
//               <span className="font-medium">Role</span>
//               <span className="capitalize text-blue-600">{user.role}</span>
//             </div>
//           )}
//           {user.department && (
//             <div className="flex justify-between border-b border-gray-200 pb-2">
//               <span className="font-medium">Department</span>
//               <span className="text-gray-600">{user.department}</span>
//             </div>
//           )}
//         </div>

//         {/* Buttons */}
//         <div className="mt-8 flex flex-col sm:flex-row gap-3">
//           <form action={logout} className="flex-1">
//             <button
//               type="submit"
//               className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 cursor-pointer"
//             >
//               Logout
//             </button>
//           </form>

//           <Link
//             href="/studentDashboard"
//             className="w-full sm:w-auto flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center rounded-lg transition-all duration-200"
//           >
//             Go to Dashboard
//           </Link>
//         </div>

//         {/* Footer */}
//         <p className="text-center text-sm text-gray-400 mt-6">
//           © {new Date().getFullYear()} God`s Way CBT Platform. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Page;





//USED AI FOR THIS DESIGN PART TOO, THE ABOVE IS WORKING FINE 100
// app/profile/page.tsx
import { getUserWithId, logout, verifyUser } from "@/lib/user-action";
import Link from "next/link";
import { redirect } from "next/navigation";
import { User, Mail, Briefcase, Building2, LogOut, LayoutDashboard, Calendar } from 'lucide-react'; // Import Lucide Icons

const Page = async () => {
  const auth = await verifyUser();
  if (!auth.success) redirect("/login");

  const user = await getUserWithId(auth.id as string);
  
  // This should theoretically not happen if verifyUser passes, but is good safety.
  if (!user) redirect("/login"); 

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "U";
  const userRole = user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "N/A";

  return (
    // 🎨 Blue Gradient Background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      
      {/* 💳 Profile Card Container (Modernized) */}
      <div className="bg-white shadow-2xl shadow-blue-300/50 rounded-3xl p-6 md:p-10 w-full max-w-sm md:max-w-md border-t-8 border-blue-600 transition-all duration-500 hover:shadow-blue-400/70">
        
        {/* 👤 Header & Avatar */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {/* Avatar Circle */}
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center text-5xl font-extrabold shadow-xl border-4 border-white">
              {initials}
            </div>
            {/* Status Badge (optional: can be used for online status, but here for icon) */}
            <div className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full border-2 border-white shadow-md">
                <User className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {user.name || "User Name"}
          </h1>
          <p className="text-md text-blue-600 font-medium mt-1">
            {user.department || "General User"}
          </p>
        </div>

        {/* --- Profile Info Grid --- */}
        <div className="space-y-4">
          
          {/* Email */}
          <InfoRow 
            icon={<Mail className="w-5 h-5 text-blue-500" />}
            label="Email"
            value={user.email}
          />
          
          {/* Role */}
          <InfoRow 
            icon={<Briefcase className="w-5 h-5 text-blue-500" />}
            label="Role"
            value={userRole}
            color="text-blue-600 font-semibold"
          />
          
          {/* Department */}
          {user.department && (
            <InfoRow 
              icon={<Building2 className="w-5 h-5 text-blue-500" />}
              label="Department/Class"
              value={user.department}
            />
          )}
          
          {/* Joined Date (Placeholder for more data) */}
          {/* <InfoRow 
            icon={<Calendar className="w-5 h-5 text-blue-500" />}
            label="Joined"
            value="Since 2024" // Replace with actual user creation date if available
          /> */}
        </div>

        {/* --- Buttons --- */}
        <div className="mt-10 flex flex-col gap-4">
          
          {/* Go to Dashboard Button */}
          {user.role === 'student' && (
            <Link
              href="/studentDashboard"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-lg transition-all duration-200 shadow-md shadow-blue-500/30 hover:shadow-blue-600/50"
            >
              <LayoutDashboard className="w-5 h-5" /> 
              Go to Dashboard
            </Link>
          )}

          {/* Logout Button */}
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 border border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by God`s Way CBT Platform.
        </p>
      </div>
    </div>
  );
};

export default Page;

// Helper component for cleaner data display
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

// 📐 Helper Component: InfoRow (for clean, icon-based data presentation)
const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, color }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white transition duration-150">
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-gray-700">{label}</span>
    </div>
    <span className={`text-gray-900 text-sm ${color || 'font-normal'}`}>
      {value}
    </span>
  </div>
);