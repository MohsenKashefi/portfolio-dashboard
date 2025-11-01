import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET single skill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: skill, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching skill:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({ skill });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json({ error: 'Failed to fetch skill' }, { status: 500 });
  }
}

// PUT update skill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .update({
        name,
        percentage,
        category: category || null,
        icon: icon || null,
        order_index: order_index || 0,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating skill:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({ skill });
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
  }
}

// DELETE skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting skill:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}
