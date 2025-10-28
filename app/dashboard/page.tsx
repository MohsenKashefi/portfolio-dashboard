"use client";

import { BarChart3, Users, Eye, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  // Mock data - will be replaced with real data from Supabase
  const stats = [
    { label: "Total Views", value: "12,543", change: "+12.5%", icon: Eye, color: "from-primary to-accent-cyan" },
    { label: "Unique Visitors", value: "3,421", change: "+8.2%", icon: Users, color: "from-accent-purple to-accent-pink" },
    { label: "Avg. Session", value: "2m 34s", change: "+5.1%", icon: BarChart3, color: "from-accent-cyan to-accent-purple" },
    { label: "Bounce Rate", value: "42.3%", change: "-3.2%", icon: TrendingUp, color: "from-accent-pink to-primary" },
  ];

  const recentViews = [
    { page: "Home", views: 4532, percentage: 36 },
    { page: "Projects", views: 3218, percentage: 26 },
    { page: "About Me", views: 2145, percentage: 17 },
    { page: "Skills", views: 1876, percentage: 15 },
    { page: "Contact", views: 772, percentage: 6 },
  ];

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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Page Views Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Most Viewed Pages */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Most Viewed Pages</h2>
            <div className="space-y-4">
              {recentViews.map((page, index) => (
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
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem
                action="New visitor from United States"
                time="2 minutes ago"
                color="bg-primary"
              />
              <ActivityItem
                action="Project viewed: Foody AI"
                time="5 minutes ago"
                color="bg-accent-cyan"
              />
              <ActivityItem
                action="Contact form submitted"
                time="12 minutes ago"
                color="bg-accent-purple"
              />
              <ActivityItem
                action="Skills section viewed"
                time="18 minutes ago"
                color="bg-accent-pink"
              />
              <ActivityItem
                action="New visitor from Canada"
                time="23 minutes ago"
                color="bg-primary"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Manage Projects"
            description="Add, edit, or remove portfolio projects"
            href="/dashboard/projects"
            color="from-primary to-accent-cyan"
            disabled
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
