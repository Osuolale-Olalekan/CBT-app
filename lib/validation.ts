export function validateName(name: string) {
  if (!name.trim()) {
    return { isValid: false, message: "Name is required" }
  }
  if (name.length < 2) {
    return { isValid: false, message: "Name must be at least 2 characters" }
  }
  return { isValid: true }
}

export function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters" }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least 1 uppercase letter" }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least 1 lowercase letter" }
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least 1 number" }
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "Password must contain at least 1 special character" }
  }

  return { isValid: true }
}

// 🔥 Strength meter
export function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

  if (score <= 2) return { level: "Weak", color: "bg-red-500" }
  if (score === 3 || score === 4) return { level: "Medium", color: "bg-yellow-500" }
  if (score === 5) return { level: "Strong", color: "bg-green-600" }

  return { level: "Weak", color: "bg-gray-300" }
}
