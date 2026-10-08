import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { coupleNames, weddingDate, email } = await req.json();

    // 1. Create Workspace
    const { data: workspace, error: wsError } = await supabaseAdmin
      .from('workspaces')
      .insert([{ 
        couple_names: coupleNames, 
        wedding_date: weddingDate 
      }])
      .select()
      .single();

    if (wsError) throw wsError;

    // 2. Create User via Supabase Auth Admin (Bypassing email rate limit by creating directly)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "Password123!",
      email_confirm: true,
      user_metadata: { workspace_id: workspace.id, role: 'COUPLE', full_name: coupleNames }
    });

    if (authError) {
      // If user already exists, we could handle it, but for now just throw
      throw authError;
    }

    // 3. Add to public.users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        workspace_id: workspace.id,
        role: 'COUPLE',
        full_name: coupleNames
      }]);
      
    if (userError) {
        await supabaseAdmin.from('users').update({
            workspace_id: workspace.id,
            role: 'COUPLE',
            full_name: coupleNames
        }).eq('id', authData.user.id);
    }

    return NextResponse.json({ success: true, workspace, defaultPassword: "Password123!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
