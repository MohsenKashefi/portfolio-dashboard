import Link from "next/link";
import { BarChart3, Users, FolderOpen, MessageSquare } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-gray-900 to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan mb-4">
            Portfolio Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            Manage your portfolio website analytics and content
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Analytics"
            description="Track page views and visitor stats"
            color="from-primary to-accent-cyan"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Visitors"
            description="Monitor your website traffic"
            color="from-accent-purple to-accent-pink"
          />
          <FeatureCard
            icon={<FolderOpen className="w-8 h-8" />}
            title="Projects"
            description="Manage your portfolio projects"
            color="from-accent-cyan to-accent-purple"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Messages"
            description="View contact form submissions"
            color="from-accent-pink to-primary"
          />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-cyan text-primary-dark font-bold text-lg rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all transform hover:scale-105"
          >
            Login to Dashboard
          </Link>
        </div>

        {/* Status */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-gray-400 text-sm">System Status: Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all hover:shadow-xl hover:shadow-primary/10">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${color} text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
