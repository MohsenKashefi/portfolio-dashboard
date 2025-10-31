"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { user, error: authError } = await signIn(email, password);

      if (authError) {
        setError(authError);
        return;
      }

      if (user) {
        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center relative">
      {/* Background Image - Dashboard themed */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWUyOTNiO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFhMjAyYztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9InVybCgjZ3JhZCkiLz48IS0tIERhc2hib2FyZCBncmlkIC0tPjxnIG9wYWNpdHk9IjAuMSI+PHBhdGggZD0iTSAwIDAgTCAxMjAwIDAgTCAxMjAwIDgwMCBMIDAgODAwIFoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTSAzMDAgMCBMIDMwMCA4MDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSA2MDAgMCBMIDYwMCA4MDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSA5MDAgMCBMIDkwMCA4MDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSAwIDIwMCBMIDEyMDAgMjAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIvPjxwYXRoIGQ9Ik0gMCA0MDAgTCAxMjAwIDQwMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDAgNjAwIEwgMTIwMCA2MDAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwhLS0gQ2hhcnQgbGluZXMgLS0+PGcgb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNIDEwMCA2MDAgTCAzMDAgNDAwIEwgNTAwIDQ1MCBMIDCWMCA zMDAgTCA5MDAgMzUwIEwgMTEwMCAyMDAiIHN0cm9rZT0iIzRhZGU4MCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTSAxMDAgNTAwIEwgMzAwIDU1MCBMIDU0MCA0MDAgTCA3MDAgNDUwIEwgOTAwIDM1MCBMIDM5MDAgMjUwIiBzdHJva2U9IiM2MzY2ZjEiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjwvZz48L3N2Zz4=')`
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Login to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Email address</label>
              <input
                type="email"
                placeholder="admin@dashboard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-0 py-3 border-b-2 border-gray-300 focus:border-black outline-none transition-colors bg-transparent text-sm disabled:opacity-50"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Password</label>
              <input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-0 py-3 border-b-2 border-gray-300 focus:border-black outline-none transition-colors bg-transparent text-sm disabled:opacity-50"
              />
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-5 h-5 border-2 ${rememberMe ? 'border-green-400' : 'border-gray-300'} rounded flex items-center justify-center transition-colors`}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && <div className="w-3 h-3 bg-green-400 rounded"></div>}
                </div>
                <span>Remember me</span>
              </label>
              <Link href="/" className="text-gray-600 hover:text-black transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-xl text-center font-medium hover:bg-gray-800 transition-colors text-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "login"}
            </button>
          </form>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-gray-600 hover:text-black transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
