// lib/auth.ts
// lib/auth.ts
// lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import User from "@/models/User"; // ✅ your Mongoose model
import dbConnect from "./dbConnect";

const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getCurrentUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedSecret, {
      algorithms: ["HS256"],
    });

    await dbConnect();
    const user = await User.findById(payload.id).lean();

    if (!user) return null;

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };
  } catch {
    return null;
  }
}




// // lib/auth.ts
// import { NextAuthOptions, getServerSession } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import User from "../models/User";
// import dbConnect from "./dbConnect";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         await dbConnect();
//         const user = await User.findOne({ email: credentials.email });

//         if (!user) return null;

//         const isPasswordValid = await user.comparePassword(
//           credentials.password
//         );
//         if (!isPasswordValid) return null;

//         return {
//           id: user._id,
//           email: user.email,
//           name: user.name,
//           role: user.role,
//           department: user.department,
//         };
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//         token.department = user.department;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.sub!;
//         session.user.role = token.role as string;
//         session.user.department = token.department as string;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
// };

// // ✅ Add this helper
// // ✅ lib/auth.ts

// export async function getCurrentUser() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) return null;

//   return {
//     id: session.user.id,                                // always defined from token.sub
//     name: session.user.name ?? "",                      // fallback to empty string
//     email: session.user.email ?? "",                    // fallback to empty string
//     role: (session.user.role as string) ?? "student",   // fallback role
//     department: (session.user.department as string) ?? undefined,
//   };
// }



