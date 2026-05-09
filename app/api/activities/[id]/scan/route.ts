// app/api/activities/[id]/scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const activityId = params.id;
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'NOT_AUTHENTICATED' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'TOKEN_REQUIRED' }, { status: 400 });
    }

    // Validate token exists and is not expired
    const { data: qrToken } = await supabase
      .from('qr_tokens')
      .select('*, activities(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!qrToken) {
      return NextResponse.json({ error: 'QR_EXPIRED' }, { status: 400 });
    }

    if (qrToken.activity_id !== activityId) {
      return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 });
    }

    // Check if activity is in progress or completed
    const activity = qrToken.activities;
    if (activity.status !== 'in_progress' && activity.status !== 'completed') {
      return NextResponse.json({ error: 'ACTIVITY_NOT_ACTIVE' }, { status: 400 });
    }

    // Check if volunteer is registered and approved
    const { data: registration } = await supabase
      .from('activity_registrations')
      .select('*')
      .eq('activity_id', activityId)
      .eq('volunteer_id', session.user.id)
      .in('status', ['approved', 'attended'])
      .single();

    if (!registration) {
      return NextResponse.json({ error: 'NOT_REGISTERED' }, { status: 400 });
    }

    // Check if already scanned
    const { data: existingLog } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('activity_id', activityId)
      .eq('volunteer_id', session.user.id)
      .single();

    if (existingLog) {
      return NextResponse.json({ error: 'ALREADY_SCANNED' }, { status: 400 });
    }

    // Calculate hours from activity times
    const hours = Math.max(0, 
      (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) 
      / (1000 * 60 * 60)
    );

    // Insert attendance log
    const { error: insertError } = await supabase
      .from('attendance_logs')
      .insert({
        activity_id: activityId,
        volunteer_id: session.user.id,
        hours_credited: hours,
        is_walk_in: false,
        scanned_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    // Update registration status to attended if not already
    if (registration.status !== 'attended') {
      await supabase
        .from('activity_registrations')
        .update({ 
          status: 'attended',
          attended_at: new Date().toISOString()
        })
        .eq('id', registration.id);
    }

    return NextResponse.json({ 
      success: true, 
      activityTitle: activity.title,
      hours: hours.toFixed(1)
    });
  } catch (error) {
    console.error('Error scanning QR:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}