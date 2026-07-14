// supabase/functions/invite-user/index.ts
// This Edge Function sends a REAL email invite via Supabase Auth.
// It uses the service_role key (server-side only) to call auth.admin.inviteUserByEmail.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get the request body
    const { email, name, role } = await req.json();

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "Email is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Create a Supabase admin client with the service_role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 3. Send the real invite email via Supabase Auth
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email.trim(), {
        data: {
          full_name: name || "",
          role: role || "member",
        },
        redirectTo: `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "")}/dashboard`,
      });

    if (inviteError) {
      console.error("Invite error:", inviteError);
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Also insert/update into app_users table for the UI
    const { error: dbError } = await supabaseAdmin.from("app_users").upsert(
      {
        name: name || "",
        email: email.trim(),
        role: role || "member",
        status: "invited",
      },
      { onConflict: "email" }
    );

    if (dbError) {
      console.warn("app_users insert warning:", dbError.message);
      // Don't fail the whole request — the invite was already sent
    }

    // 5. Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
        user: inviteData?.user ?? null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
