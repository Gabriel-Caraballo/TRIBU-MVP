// app/api/activities/[id]/qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
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
    // Verify user is org admin of this activity
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: orgMember } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', session.user.id)
      .single();

    const { data: activity } = await supabase
      .from('activities')
      .select('org_id')
      .eq('id', activityId)
      .single();

    if (!activity || activity.org_id !== orgMember?.org_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if there's a valid token
    const { data: existingToken } = await supabase
      .from('qr_tokens')
      .select('*')
      .eq('activity_id', activityId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingToken) {
      return NextResponse.json({
        token: existingToken.token,
        expiresAt: existingToken.expires_at
      });
    }

    // Generate new token with 30 second expiry
    const { data: newToken, error } = await supabase
      .from('qr_tokens')
      .insert({
        activity_id: activityId,
        expires_at: new Date(Date.now() + 30 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      token: newToken.token,
      expiresAt: newToken.expires_at
    });
  } catch (error) {
    console.error('Error generating QR token:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}