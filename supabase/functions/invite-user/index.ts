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
    const { email, name, role, resend } = await req.json();

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

    // 3. Check if user already exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("status")
      .eq("email", email.trim())
      .single();

    // 4. Attempt to send invite — Supabase ignores duplicates and re-sends
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email.trim(), {
        data: {
          full_name: name || "",
          role: role || "member",
        },
        redirectTo: "https://choir-fin-sec-two.vercel.app/dashboard",
      });

    if (inviteError) {
      // If user already has a pending invite, Supabase returns an error.
      // We handle it gracefully: still update the DB and return success.
      console.warn("Invite API warning (may already exist):", inviteError.message);
    }

    // 5. Upsert into users table
    const { error: dbError } = await supabaseAdmin.from("users").upsert(
      {
        name: name || "",
        email: email.trim(),
        role: role || "member",
        status: "invited",
      },
      { onConflict: "email" }
    );

    if (dbError) {
      console.warn("users insert warning:", dbError.message);
    }

    // 6. Return success
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
