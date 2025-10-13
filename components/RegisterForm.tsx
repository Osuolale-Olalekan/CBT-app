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
import { CheckCircle2, Eye, EyeOff } from "lucide-react"; // 👈 added icons
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

    if (name === "password") {
      setPasswordStrength(getPasswordStrength(value));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const nameCheck = validateName(form.name);
    if (!nameCheck.isValid) newErrors.name = nameCheck.message!;

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email";
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
      setErrors({ general: result.message });
    }
  };

  return (
    <div
      className="relative max-w-md w-full mx-auto mt-10 p-6 
              bg-white/70 rounded-xl shadow-lg 
              backdrop-blur-md border border-white/40 overflow-hidden"
    >
      <Image
        src="/school_logo.png"
        alt="School Logo"
        width={250}
        height={180}
        priority={false}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                 opacity-10 pointer-events-none select-none"
      />

      <h2 className="text-2xl font-bold text-center text-blue-950 mb-6 relative z-10">
        Register for CBT Platform
      </h2>

      {showSuccess && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[90%] flex items-center gap-2 rounded-lg bg-green-100 border border-green-300 p-3 text-green-800 shadow-md animate-fade-in z-10">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">
            Registration successful! Please log in.
          </span>
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={registerUserHandler} className="space-y-4">
        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleInputChange}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.name && <p className="text-red-600 text-xs">{errors.name}</p>}

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleInputChange}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.email && <p className="text-red-600 text-xs">{errors.email}</p>}

        {/* Department */}
        <select
          name="department"
          value={form.department}
          onChange={handleInputChange}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.department ? "border-red-400" : "border-gray-300"
          }`}
        >
          <option value="">Select Department</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        {errors.department && (
          <p className="text-red-600 text-xs">{errors.department}</p>
        )}

        {/* Password + Strength Meter */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleInputChange}
            className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-400" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          {form.password && (
            <div className="mt-2">
              <div className="w-full h-2 rounded bg-gray-200">
                <div
                  className={`h-2 rounded ${passwordStrength.color}`}
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
                className={`text-xs mt-1 ${
                  passwordStrength.level === "Weak"
                    ? "text-red-500"
                    : passwordStrength.level === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {passwordStrength.level} password
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-red-600 text-xs">{errors.password}</p>
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
            className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? "border-red-400" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          {errors.confirmPassword && (
            <p className="text-red-600 text-xs">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline font-medium">
          Login here
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;
