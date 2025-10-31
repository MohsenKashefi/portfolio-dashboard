"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Users, FolderOpen, MessageSquare, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { signIn } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const slides = [
    {
      title: "ANALYTICS DASHBOARD",
      subtitle: "Real-time tracking",
      icon: <BarChart3 className="w-12 h-12" />,
      color: "from-blue-600 to-cyan-600"
    },
    {
      title: "PROJECT MANAGEMENT",
      subtitle: "Dynamic content",
      icon: <FolderOpen className="w-12 h-12" />,
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "VISITOR INSIGHTS",
      subtitle: "User analytics",
      icon: <Users className="w-12 h-12" />,
      color: "from-green-600 to-emerald-600"
    },
    {
      title: "MESSAGE CENTER",
      subtitle: "Contact management",
      icon: <MessageSquare className="w-12 h-12" />,
      color: "from-orange-600 to-red-600"
    },
    {
      title: "SECURE ACCESS",
      subtitle: "Protected data",
      icon: <TrendingUp className="w-12 h-12" />,
      color: "from-indigo-600 to-blue-600"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

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
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex">
      {/* Left Section - Fixed height */}
      <div className="w-full lg:w-1/2 h-screen flex flex-col justify-between p-6 lg:p-12 overflow-y-auto">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-4 tracking-wider">MODERN PORTFOLIO MANAGEMENT</p>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
            BUILDING THE
            <br />
            <span className="relative inline-block">
              FUTURE
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-green-400 -z-10"></span>
            </span>
            {" "}OF WEB
            <br />
            DEVELOPMENT.
            <span className="inline-flex ml-3">
              <span className="w-6 h-6 rounded-full bg-gray-800 inline-block"></span>
              <span className="w-6 h-6 rounded-full bg-gray-600 inline-block -ml-3"></span>
              <span className="w-6 h-6 rounded-full bg-gray-400 inline-block -ml-3"></span>
              <span className="w-6 h-6 rounded-full bg-green-400 inline-block -ml-3"></span>
            </span>
          </h1>
        </div>

        {/* About Section - Exact design from reference */}
        <div className="bg-black text-white rounded-3xl p-8 lg:p-10 mt-6 relative overflow-hidden h-48 lg:h-56 flex items-center">
          {/* Background Image - Modern workspace/developer setup */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>

          {/* Text Overlay - Title on left, description on right */}
          <div className="relative z-10 flex items-center gap-16 w-full">
            <h3 className="text-3xl font-normal whitespace-nowrap">About me</h3>
            <p className="text-white text-lg font-light leading-relaxed">
              Hey, I'm Mohsen — a developer who actually enjoys solving problems.<br />
              I've spent the last <span className="font-semibold">3+ years</span> building apps from scratch — Flutter, backend systems, and everything in between.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - DASHBOARD BACKGROUND (EXACT LIKE REFERENCE) */}
      <div className="hidden lg:flex w-1/2 h-screen relative overflow-hidden">
        {/* Background Image - DASHBOARD/ANALYTICS PHOTO AS FULL BACKGROUND */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80')`
          }}
        ></div>

        {/* Content Container */}
        <div className="relative z-10 w-full flex flex-col items-center justify-between h-full p-12">
          {/* Top Section - Slide Title */}
          <div className="text-center text-white pt-4">
            <h2 className="text-4xl font-bold mb-2">{slides[currentSlide].title}</h2>
            <p className="text-lg text-white/90">{slides[currentSlide].subtitle}</p>
          </div>

          {/* Center - Login Card (NO CAR IMAGE INSIDE) */}
          <div className="w-full max-w-md">
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
                  <label className="text-xs text-gray-500 mb-2 block font-medium">Username</label>
                  <input
                    type="email"
                    placeholder="admin@dashboard.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-0 py-3 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent text-base disabled:opacity-50"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="text-xs text-gray-500 mb-2 block font-medium">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-0 py-3 border-b border-gray-200 focus:border-black outline-none transition-colors bg-transparent text-base disabled:opacity-50"
                  />
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      className={`w-5 h-5 border-2 ${rememberMe ? 'border-green-400 bg-green-400' : 'border-gray-300'} rounded flex items-center justify-center transition-colors`}
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">Remember me</span>
                  </label>
                  <a href="#" className="text-gray-500 hover:text-black transition-colors">
                    Forgot your password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-4 rounded-2xl text-center font-medium hover:bg-gray-800 transition-colors text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "login"}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Section - Slide Counter & Navigation */}
          <div className="flex items-center justify-between w-full pb-4">
            <div className="text-white text-3xl font-bold">
              {String(currentSlide + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
            </div>
            <div className="flex gap-3">
              <button
                onClick={prevSlide}
                className="w-14 h-14 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center transition-colors border border-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="w-14 h-14 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center transition-colors border border-white/20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Login Form */}
      <div className="lg:hidden fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6 z-50">
        {/* Background Image - Dashboard/Analytics themed */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80')`
          }}
        ></div>

        <div className="relative z-10 w-full max-w-md">
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

              {/* Remember me */}
              <div className="flex items-center text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-5 h-5 border-2 ${rememberMe ? 'border-green-400' : 'border-gray-300'} rounded flex items-center justify-center transition-colors`}
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    {rememberMe && <div className="w-3 h-3 bg-green-400 rounded"></div>}
                  </div>
                  <span>Remember me</span>
                </label>
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
          </div>
        </div>
      </div>
    </div>
  );
}
