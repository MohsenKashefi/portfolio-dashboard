import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get dashboard stats using the function we created
    const { data: stats, error: statsError } = await supabase
      .rpc('get_dashboard_stats');

    if (statsError) {
      console.error('Stats error:', statsError);
    }

    // Get daily views for the last 30 days
    const { data: dailyViews, error: dailyError } = await supabase
      .rpc('get_daily_page_views', { days_back: 30 });

    if (dailyError) {
      console.error('Daily views error:', dailyError);
    }

    // Get popular pages
    const { data: popularPages, error: pagesError } = await supabase
      .rpc('get_popular_pages', { limit_count: 10 });

    if (pagesError) {
      console.error('Popular pages error:', pagesError);
    }

    // Get recent activity (last 20 page views)
    const { data: recentActivity, error: activityError } = await supabase
      .from('page_views')
      .select('page_path, created_at, country, device_type')
      .order('created_at', { ascending: false })
      .limit(20);

    if (activityError) {
      console.error('Recent activity error:', activityError);
    }

    return NextResponse.json({
      stats: stats?.[0] || {
        total_views: 0,
        unique_sessions: 0,
        total_projects: 0,
        unread_messages: 0,
      },
      dailyViews: dailyViews || [],
      popularPages: popularPages || [],
      recentActivity: recentActivity || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
