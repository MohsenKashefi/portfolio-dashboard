"use client";

import { BarChart3, Users, Eye, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useEffect, useState } from "react";

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
    { label: "Total Views", value: stats.total_views, icon: Eye, color: "from-primary to-accent-cyan" },
    { label: "Unique Visitors", value: stats.unique_sessions, icon: Users, color: "from-accent-purple to-accent-pink" },
    { label: "Total Projects", value: stats.total_projects, icon: BarChart3, color: "from-accent-cyan to-accent-purple" },
    { label: "Unread Messages", value: stats.unread_messages, icon: TrendingUp, color: "from-accent-pink to-primary" },
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
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-gray-900 to-black">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan">
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-gray-400 mt-4">Loading dashboard data...</p>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Page Views Chart */}
        {!loading && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Most Viewed Pages */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Most Viewed Pages</h2>
              <div className="space-y-4">
                {recentViews.length > 0 ? (
                  recentViews.map((page, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{page.page}</span>
                        <span className="text-gray-400 text-sm">{page.views.toLocaleString()} views</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full transition-all duration-500"
                          style={{ width: `${page.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No page views yet</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, index) => {
                    const colors = ['bg-primary', 'bg-accent-cyan', 'bg-accent-purple', 'bg-accent-pink'];
                    const color = colors[index % colors.length];
                    const location = activity.country ? ` from ${activity.country}` : '';
                    const device = activity.device_type ? ` (${activity.device_type})` : '';

                    return (
                      <ActivityItem
                        key={index}
                        action={`Page viewed: ${activity.page_path}${location}${device}`}
                        time={formatTimeAgo(activity.created_at)}
                        color={color}
                      />
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Manage Projects"
            description="Add, edit, or remove portfolio projects"
            href="/dashboard/projects"
            color="from-primary to-accent-cyan"
          />
          <QuickActionCard
            title="View Messages"
            description="Check contact form submissions"
            href="/dashboard/messages"
            color="from-accent-purple to-accent-pink"
            disabled
          />
          <QuickActionCard
            title="Update Skills"
            description="Manage your tech stack and skills"
            href="/dashboard/skills"
            color="from-accent-cyan to-accent-purple"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ action, time, color }: { action: string; time: string; color: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 ${color} rounded-full mt-2`} />
      <div className="flex-1">
        <p className="text-white text-sm">{action}</p>
        <p className="text-gray-400 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, color, disabled = false }: {
  title: string;
  description: string;
  href: string;
  color: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="relative block p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl opacity-60 cursor-not-allowed">
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
        <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${color} text-white text-xs font-bold mb-3`}>
          Coming Soon
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="block p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all group"
    >
      <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${color} text-white text-xs font-bold mb-3`}>
        Quick Action
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </Link>
  );
}
