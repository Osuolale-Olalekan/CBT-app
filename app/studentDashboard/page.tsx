// import { redirect } from "next/navigation";
// import { getCurrentUser } from "@/lib/auth";
// import StudentDashboard from "@/components/StudentDashboard";

// export default async function DashboardPage() {
//   const user = await getCurrentUser();

//   if (!user) {
//     redirect("/login");
//   }

//   return <StudentDashboard user={user} />;
// }

// app/studentDashboard/page.tsx
import StudentDashboard from "@/components/StudentDashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Not authorized</div>;
  }

  return (
    <div>
      {/* <h1>Welcome, {user.role}</h1> */}
      {/* <p>Your ID is {user.id}</p> */}
      <StudentDashboard user={user}/>

    </div>
  );
}
