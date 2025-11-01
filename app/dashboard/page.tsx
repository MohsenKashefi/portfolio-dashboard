"use client";

import { Users, Eye, TrendingUp, Lock, LogOut, FolderOpen, MessageSquare, Moon, Sun, Award } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";

interface Stats {
  total_views: number;
  unique_sessions: number;
  total_projects: number;
  unread_messages: number;
}

interface PopularPage {
  page_path: string;
  view_count: number;
}

interface RecentActivity {
  page_path: string;
  created_at: string;
  country: string | null;
  device_type: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [stats, setStats] = useState<Stats>({
    total_views: 0,
    unique_sessions: 0,
    total_projects: 0,
    unread_messages: 0,
  });
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {
          total_views: 0,
          unique_sessions: 0,
          total_projects: 0,
          unread_messages: 0,
        });
        setPopularPages(data.popularPages || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const statsCards = [
    { label: "Total Views", value: stats.total_views, icon: Eye, color: "from-blue-600 to-cyan-600" },
    { label: "Unique Visitors", value: stats.unique_sessions, icon: Users, color: "from-purple-600 to-pink-600" },
    { label: "Total Projects", value: stats.total_projects, icon: FolderOpen, color: "from-green-600 to-emerald-600" },
    { label: "Unread Messages", value: stats.unread_messages, icon: MessageSquare, color: "from-orange-600 to-red-600" },
  ];

  // Calculate percentages for popular pages
  const totalViews = popularPages.reduce((sum, page) => sum + page.view_count, 0);
  const recentViews = popularPages.map(page => ({
    page: page.page_path.replace('/', '') || 'Home',
    views: page.view_count,
    percentage: totalViews > 0 ? Math.round((page.view_count / totalViews) * 100) : 0,
  }));

  // Format recent activity
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-primary-dark via-gray-900 to-black'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-colors duration-500 ${
        isDarkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white/70 border-white/20'
      }`}>
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold transition-colors ${
              isDarkMode
                ? 'text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
            }`}>Dashboard</h1>
            <p className={`text-sm mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Welcome back, Mohsen</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white'
                  : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-black/90 hover:bg-black text-white'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
            <p className="text-gray-500 mt-4 font-medium">Loading dashboard data...</p>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <div
                  key={index}
                  className={`backdrop-blur-sm border rounded-2xl p-6 hover:border-white/20 transition-all ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/60 border-white/40 hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${
                    isDarkMode
                      ? 'text-white'
                      : 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
                  }`}>{stat.value.toLocaleString()}</div>
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Analytics Section */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Most Viewed Pages */}
              <div className={`backdrop-blur-sm border rounded-2xl p-8 hover:border-white/20 transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/60 border-white/40 hover:bg-white/70'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode
                    ? 'text-white'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                }`}>Most Viewed Pages</h2>
                <div className="space-y-5">
                  {recentViews.length > 0 ? (
                    recentViews.map((page, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{page.page}</span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{page.views.toLocaleString()} views</span>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-white/10' : 'bg-white/50'}`}>
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${page.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-12 font-medium">No page views yet</p>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`backdrop-blur-sm border rounded-2xl p-8 hover:border-white/20 transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/60 border-white/40 hover:bg-white/70'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode
                    ? 'text-white'
                    : 'bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent'
                }`}>Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity, index) => {
                      const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500'];
                      const color = colors[index % colors.length];
                      const location = activity.country ? ` from ${activity.country}` : '';
                      const device = activity.device_type ? ` (${activity.device_type})` : '';

                      return (
                        <ActivityItem
                          key={index}
                          action={`${activity.page_path}${location}${device}`}
                          time={formatTimeAgo(activity.created_at)}
                          color={color}
                          isDarkMode={isDarkMode}
                        />
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center py-12 font-medium">No recent activity</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${
                isDarkMode
                  ? 'text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
              }`}>Quick Actions</h2>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                  <QuickActionCard
                    title="Manage Projects"
                    description="Add, edit, or remove portfolio projects"
                    href="/dashboard/projects"
                    icon={FolderOpen}
                    color="from-blue-600 to-cyan-600"
                    isDarkMode={isDarkMode}
                  />
                  <QuickActionCard
                    title="Manage Skills"
                    description="Update your skills and proficiency levels"
                    href="/dashboard/skills"
                    icon={Award}
                    color="from-orange-600 to-red-600"
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ action, time, color, isDarkMode }: { action: string; time: string; color: string; isDarkMode: boolean }) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg backdrop-blur-sm transition-all ${
      isDarkMode
        ? 'bg-white/5 hover:bg-white/10'
        : 'bg-white/30 hover:bg-white/50'
    }`}>
      <div className={`w-3 h-3 ${color} rounded-full mt-1.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{action}</p>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{time}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon: Icon, color, disabled = false, isDarkMode }: {
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  disabled?: boolean;
  isDarkMode?: boolean;
}) {
  if (disabled) {
    return (
      <div className={`relative block p-6 backdrop-blur-sm border rounded-2xl opacity-60 cursor-not-allowed ${
        isDarkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white/40 border-white/30'
      }`}>
        <div className="absolute top-4 right-4">
          <Lock className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${color} text-white text-xs font-bold mb-3`}>
          <Icon className="w-4 h-4" />
          Coming Soon
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`block p-6 backdrop-blur-sm border rounded-2xl hover:border-white/20 transition-all group ${
        isDarkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white/60 border-white/40 hover:bg-white/70'
      }`}
    >
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${color} text-white text-xs font-bold mb-3`}>
        <Icon className="w-4 h-4" />
        Quick Action
      </div>
      <h3 className={`text-xl font-bold mb-2 transition ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
    </Link>
  );
}
