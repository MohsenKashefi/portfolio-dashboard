import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all projects
export async function GET(request: NextRequest) {
  try {
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects: projects || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      technologies,
      github_url,
      live_url,
      image_path,
      icon_name,
      is_featured,
      order_index
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([
        {
          title,
          description,
          category: category || 'Other',
          technologies: technologies || [],
          github_url,
          live_url,
          image_path,
          icon_name,
          is_featured: is_featured || false,
          order_index: order_index || 0,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, project: data[0] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
