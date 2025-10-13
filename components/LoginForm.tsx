"use client"

import { loginAction } from "@/lib/user-action"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useState } from "react"
import { validateEmail } from "@/lib/validation"
import { CheckCircle2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

const LoginForm = () => {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // 👈 added state

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!form.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!form.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    const result = await loginAction(form)
    setLoading(false)

    if (result.success) {
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        if (result.role === "admin") {
          router.push("/admin/adminDashboard")
        } else {
          router.push("/profile")
        }
      }, 1500)
    } else {
      setErrors({ general: result.message || "Login failed" })
    }
  }

  return (
    <div
      className="relative max-w-md w-full mx-auto mt-10 p-6 
                  bg-white/70 rounded-xl shadow-lg 
                  backdrop-blur-md border border-white/40 overflow-hidden"
    >
      {/* ✅ Watermark Logo */}
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
        Login to CBT Platform
      </h2>

      {/* ✅ Success Alert */}
      {showSuccess && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[90%] flex items-center gap-2 rounded-lg bg-green-100 border border-green-300 p-3 mt-3 text-green-800 shadow-md animate-fade-in z-10">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium">Login successful!</span>
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.email && <p className="text-red-600 text-xs">{errors.email}</p>}

        {/* Password with Eye Toggle */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
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
        </div>
        {errors.password && (
          <p className="text-red-600 text-xs">{errors.password}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:bg-blue-300 cursor-pointer"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <a
          href="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Register here
        </a>
      </p>
    </div>
  )
}

export default LoginForm
