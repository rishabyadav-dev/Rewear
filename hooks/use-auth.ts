"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const user = session?.user
  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Login failed" }
    }
  }

  const loginWithGoogle = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const callbackUrl = urlParams.get("callbackUrl")
      await signIn("google", { callbackUrl: callbackUrl || "/dashboard" })
    } catch (error) {
      console.error("Google login error:", error)
    }
  }



  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Registration failed")
      }

      // Auto-login after successful registration
      const loginResult = await login(email, password)
      return loginResult
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Registration failed" 
      }
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    register,
    update,
  }
}
