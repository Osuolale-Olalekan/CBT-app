//WORKING BUT I USED THE ONE BELOW COZ OF DESIGN
// "use client";

// import { registerUser } from "@/lib/user-action";
// import { useRouter } from "next/navigation";
// import { ChangeEvent, FormEvent, useState } from "react";
// import { DEPARTMENTS } from "@/lib/constants";
// import {
//   validateName,
//   validateEmail,
//   validatePassword,
//   getPasswordStrength,
// } from "@/lib/validation";
// import { CheckCircle2, Eye, EyeOff } from "lucide-react"; // 👈 added icons
// import Image from "next/image";

// const RegisterForm = () => {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     department: "",
//   });
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [loading, setLoading] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [passwordStrength, setPasswordStrength] = useState<{
//     level: string;
//     color: string;
//   }>({
//     level: "",
//     color: "bg-gray-300",
//   });

//   // 👁️ states for toggles
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleInputChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));

//     if (name === "password") {
//       setPasswordStrength(getPasswordStrength(value));
//     }

//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {};

//     const nameCheck = validateName(form.name);
//     if (!nameCheck.isValid) newErrors.name = nameCheck.message!;

//     if (!form.email) {
//       newErrors.email = "Email is required";
//     } else if (!validateEmail(form.email)) {
//       newErrors.email = "Please enter a valid email";
//     }

//     const passwordCheck = validatePassword(form.password);
//     if (!passwordCheck.isValid) newErrors.password = passwordCheck.message!;

//     if (form.password !== form.confirmPassword) {
//       newErrors.confirmPassword = "Passwords do not match";
//     }

//     if (!form.department) {
//       newErrors.department = "Please select your department";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const registerUserHandler = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setErrors({});
//     if (!validateForm()) return;

//     setLoading(true);
//     const result = await registerUser({
//       name: form.name,
//       email: form.email,
//       password: form.password,
//       department: form.department,
//       role: "student",
//     });
//     setLoading(false);

//     if (result.success) {
//       setShowSuccess(true);
//       setTimeout(() => {
//         setShowSuccess(false);
//         router.push("/login");
//       }, 2500);
//     } else {
//       setErrors({ general: result.message });
//     }
//   };

//   return (
//     <div
//       className="relative max-w-md w-full mx-auto mt-10 p-6 
//               bg-white/70 rounded-xl shadow-lg 
//               backdrop-blur-md border border-white/40 overflow-hidden"
//     >
//       <Image
//         src="/school_logo.png"
//         alt="School Logo"
//         width={250}
//         height={180}
//         priority={false}
//         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
//                  opacity-10 pointer-events-none select-none"
//       />

//       <h2 className="text-2xl font-bold text-center text-blue-950 mb-6 relative z-10">
//         Register for CBT Platform
//       </h2>

//       {showSuccess && (
//         <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[90%] flex items-center gap-2 rounded-lg bg-green-100 border border-green-300 p-3 text-green-800 shadow-md animate-fade-in z-10">
//           <CheckCircle2 className="w-5 h-5 text-green-600" />
//           <span className="text-sm font-medium">
//             Registration successful! Please log in.
//           </span>
//         </div>
//       )}

//       {errors.general && (
//         <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
//           {errors.general}
//         </div>
//       )}

//       <form onSubmit={registerUserHandler} className="space-y-4">
//         {/* Name */}
//         <input
//           type="text"
//           name="name"
//           placeholder="Full Name"
//           value={form.name}
//           onChange={handleInputChange}
//           className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
//             errors.name ? "border-red-400" : "border-gray-300"
//           }`}
//         />
//         {errors.name && <p className="text-red-600 text-xs">{errors.name}</p>}

//         {/* Email */}
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleInputChange}
//           className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
//             errors.email ? "border-red-400" : "border-gray-300"
//           }`}
//         />
//         {errors.email && <p className="text-red-600 text-xs">{errors.email}</p>}

//         {/* Department */}
//         <select
//           name="department"
//           value={form.department}
//           onChange={handleInputChange}
//           className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
//             errors.department ? "border-red-400" : "border-gray-300"
//           }`}
//         >
//           <option value="">Select Department</option>
//           {DEPARTMENTS.map((dept) => (
//             <option key={dept} value={dept}>
//               {dept}
//             </option>
//           ))}
//         </select>
//         {errors.department && (
//           <p className="text-red-600 text-xs">{errors.department}</p>
//         )}

//         {/* Password + Strength Meter */}
//         <div className="relative w-full">
//           <input
//             type={showPassword ? "text" : "password"}
//             name="password"
//             placeholder="Password"
//             value={form.password}
//             onChange={handleInputChange}
//             className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
//               errors.password ? "border-red-400" : "border-gray-300"
//             }`}
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword((prev) => !prev)}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//             aria-label={showPassword ? "Hide password" : "Show password"}
//           >
//             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//           </button>

//           {form.password && (
//             <div className="mt-2">
//               <div className="w-full h-2 rounded bg-gray-200">
//                 <div
//                   className={`h-2 rounded ${passwordStrength.color}`}
//                   style={{
//                     width:
//                       passwordStrength.level === "Weak"
//                         ? "33%"
//                         : passwordStrength.level === "Medium"
//                         ? "66%"
//                         : "100%",
//                   }}
//                 />
//               </div>
//               <p
//                 className={`text-xs mt-1 ${
//                   passwordStrength.level === "Weak"
//                     ? "text-red-500"
//                     : passwordStrength.level === "Medium"
//                     ? "text-yellow-600"
//                     : "text-green-600"
//                 }`}
//               >
//                 {passwordStrength.level} password
//               </p>
//             </div>
//           )}
//           {errors.password && (
//             <p className="text-red-600 text-xs">{errors.password}</p>
//           )}
//         </div>

//         {/* Confirm Password with toggle */}
//         <div className="relative w-full">
//           <input
//             type={showConfirmPassword ? "text" : "password"}
//             name="confirmPassword"
//             placeholder="Confirm Password"
//             value={form.confirmPassword}
//             onChange={handleInputChange}
//             className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
//               errors.confirmPassword ? "border-red-400" : "border-gray-300"
//             }`}
//           />
//           <button
//             type="button"
//             onClick={() => setShowConfirmPassword((prev) => !prev)}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//             aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
//           >
//             {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//           </button>

//           {errors.confirmPassword && (
//             <p className="text-red-600 text-xs">{errors.confirmPassword}</p>
//           )}
//         </div>

//         {/* Submit Button */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:bg-blue-300"
//         >
//           {loading ? "Registering..." : "Register"}
//         </button>
//       </form>

//       <p className="mt-6 text-center text-sm text-gray-600">
//         Already have an account?{" "}
//         <a href="/login" className="text-blue-600 hover:underline font-medium">
//           Login here
//         </a>
//       </p>
//     </div>
//   );
// };

// export default RegisterForm;







//AI DESIGN ONLY FOR GOOD DESIGN
"use client";

import { registerUser } from "@/lib/user-action";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { DEPARTMENTS } from "@/lib/constants";
import {
  validateName,
  validateEmail,
  validatePassword,
  getPasswordStrength,
} from "@/lib/validation";
import { CheckCircle2, Eye, EyeOff, Loader2, User, Mail, Lock, Building2 } from "lucide-react"; // 👈 Added more icons
import Image from "next/image";

const RegisterForm = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    level: string;
    color: string;
  }>({
    level: "",
    color: "bg-gray-300",
  });

  // 👁️ states for toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear specific error on change

    if (name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const nameCheck = validateName(form.name);
    if (!nameCheck.isValid) newErrors.name = nameCheck.message!;

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.isValid) newErrors.password = passwordCheck.message!;

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.department) {
      newErrors.department = "Please select your department";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerUserHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    setLoading(true);
    const result = await registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
      department: form.department,
      role: "student",
    });
    setLoading(false);

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/login");
      }, 2500);
    } else {
      setErrors({ general: result.message || "Registration failed. Please try again." });
    }
  };

  return (
    // ✨ ENHANCEMENT: Glassmorphism style with blue shadow/border
    <div
      className="relative max-w-lg w-full mx-auto my-8 p-8 
                 bg-white/85 rounded-3xl shadow-2xl 
                 backdrop-blur-lg border border-blue-100/50 
                 overflow-hidden transition-all duration-300 hover:shadow-blue-500/30"
    >
      {/* 🔹 BLUE ACCENT: Subtle blue gradient background for visual appeal */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-white -z-10 opacity-70"></div>

      {/* 🖼️ Watermark Logo */}
      <Image
        src="/school_logo.png"
        alt="School Logo"
        width={300}
        height={220}
        priority={false}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                   opacity-15 pointer-events-none select-none"
      />

      {/* 标题 */}
      <h2 className="text-3xl font-extrabold text-blue-900 text-center mb-8 relative z-10 tracking-tight">
        Create Your Account
      </h2>

      {/* ✅ Success Alert (Enhanced animation and style) */}
      {showSuccess && (
        <div className="absolute top-0 left-0 w-full flex items-center justify-center h-full bg-green-50/90 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-green-100 border-2 border-green-500 p-6 text-green-800 shadow-xl scale-100 animate-pulse-once">
            <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce-in" />
            <span className="text-xl font-semibold">Registration successful!</span>
            <span className="text-sm font-medium">Redirecting to login...</span>
          </div>
        </div>
      )}

      {/* ❌ General Error */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm transition-all duration-300">
          {errors.general}
        </div>
      )}

      <form onSubmit={registerUserHandler} className="space-y-6">
        {/* Name Field */}
        <div className="relative">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleInputChange}
            className={`w-full rounded-xl border px-4 py-3 pl-10 text-base text-gray-800 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-200 ${
              errors.name ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-500"
            }`}
            aria-invalid={!!errors.name}
          />
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleInputChange}
            className={`w-full rounded-xl border px-4 py-3 pl-10 text-base text-gray-800 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-200 ${
              errors.email ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-500"
            }`}
            aria-invalid={!!errors.email}
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Department Select (Enhanced styles) */}
        <div className="relative">
          <select
            name="department"
            value={form.department}
            onChange={handleInputChange}
            className={`w-full rounded-xl border appearance-none px-4 py-3 pl-10 text-base text-gray-800 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-200 ${
              errors.department ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-500"
            } ${!form.department ? "text-gray-500" : "text-gray-800"}`} // Placeholder color
            aria-invalid={!!errors.department}
          >
            <option value="" disabled>
              Select Your Department
            </option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} className="text-gray-800">
                {dept}
              </option>
            ))}
          </select>
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          {errors.department && (
            <p className="text-red-600 text-sm mt-1">{errors.department}</p>
          )}
        </div>

        {/* Password + Strength Meter (Combined section) */}
        <div>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleInputChange}
              className={`w-full rounded-xl border px-4 py-3 pl-10 pr-12 text-base text-gray-800 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-200 ${
                errors.password ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-500"
              }`}
              aria-invalid={!!errors.password}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200 p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {/* Password Strength Meter */}
          {form.password && (
            <div className="mt-2 flex items-center justify-between">
              <div className="w-3/4 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${passwordStrength.color}`}
                  style={{
                    width:
                      passwordStrength.level === "Weak"
                        ? "33%"
                        : passwordStrength.level === "Medium"
                        ? "66%"
                        : "100%",
                  }}
                />
              </div>
              <p
                className={`text-xs font-semibold uppercase ml-2 transition-colors duration-500 ${
                  passwordStrength.level === "Weak"
                    ? "text-red-500"
                    : passwordStrength.level === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {passwordStrength.level}
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password with toggle */}
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleInputChange}
            className={`w-full rounded-xl border px-4 py-3 pl-10 pr-12 text-base text-gray-800 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-200 ${
              errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-500"
            }`}
            aria-invalid={!!errors.confirmPassword}
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200 p-1"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button (Interactive & Visual Enhancements) */}
        <button
          type="submit"
          disabled={loading || showSuccess}
          className="w-full h-12 flex items-center justify-center gap-2 
                     rounded-xl bg-blue-600 text-white text-lg font-semibold 
                     shadow-lg shadow-blue-500/40 
                     hover:bg-blue-700 hover:shadow-blue-600/50 
                     transition-all duration-300 ease-in-out 
                     disabled:bg-blue-400 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            "Register Account"
          )}
        </button>
      </form>

      {/* Footer Link */}
      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a 
          href="/login" 
          className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors duration-200"
        >
          Login here
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;