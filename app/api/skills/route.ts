import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all skills
export async function GET() {
  try {
    const { data: skills, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching skills:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

// POST create new skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, percentage, category, icon, order_index } = body;

    if (!name || percentage === undefined) {
      return NextResponse.json(
        { error: 'Name and percentage are required' },
        { status: 400 }
      );
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const { data: skill, error } = await supabaseAdmin
      .from('skills')
      .insert([
        {
          name,
          percentage,
          category: category || null,
          icon: icon || null,
          order_index: order_index || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating skill:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}
