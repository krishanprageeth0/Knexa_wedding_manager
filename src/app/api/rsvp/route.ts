import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using Service Role to bypass RLS for external API integration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guest_id, workspace_id, rsvp_status, pax, meal_preference, wishes } = body;

    if (!guest_id || !workspace_id || !rsvp_status) {
      return NextResponse.json(
        { error: "Missing required RSVP fields" },
        { status: 400 }
      );
    }

    // Update the guest record in the database
    const { data, error } = await supabase
      .from("guests")
      .update({
        status: rsvp_status,
        rsvp_received: true,
        pax: pax || 1,
        meal_preference: meal_preference || null,
        wishes: wishes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", guest_id)
      .eq("workspace_id", workspace_id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating RSVP:", error);
      return NextResponse.json(
        { error: "Failed to update RSVP" },
        { status: 500 }
      );
    }

    // Optionally: Trigger an automated notification to the couple's dashboard/PWA via webhooks/OneSignal here

    return NextResponse.json({
      success: true,
      message: "RSVP synced successfully",
      data,
    });
  } catch (error) {
    console.error("RSVP Sync API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
