import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Parse request body
    const { email, name, role, siteUrl } = await req.json();
    const cleanEmail = email?.trim().toLowerCase();
    const redirectBase = siteUrl || Deno.env.get("SITE_URL") || "https://choir-fin-sec-two.vercel.app";

    if (!cleanEmail) {
      return new Response(
        JSON.stringify({ error: "Email is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Instantiate Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 3. Invite or re-invite user via Auth Admin API
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(cleanEmail, {
        data: {
          full_name: name || "",
          role: role || "member",
        },
        redirectTo: `${redirectBase}/dashboard`,
      });

    if (inviteError) {
      console.warn("Auth Invite warning:", inviteError.message);
      // Optional: Check if error is something other than user already exists
    }

    // 4. Retrieve user ID from Auth (either newly invited or existing)
    let authUserId = inviteData?.user?.id;

    if (!authUserId) {
      // If inviteUserByEmail didn't return a user (e.g. user already exists), fetch their Auth ID
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const match = existingUser?.users?.find(u => u.email === cleanEmail);
      if (match) authUserId = match.id;
    }

    // 5. Check if user already exists in public.app_users
    const { data: existingPublicUser } = await supabaseAdmin
      .from("app_users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingPublicUser) {
      // Update existing record
      await supabaseAdmin
        .from("app_users")
        .update({
          name: name || "",
          role: role || "member",
          status: "invited",
        })
        .eq("email", cleanEmail);
    } else {
      // Insert new record (linking Auth ID if available)
      await supabaseAdmin.from("app_users").insert({
        ...(authUserId ? { id: authUserId } : {}),
        name: name || "",
        email: cleanEmail,
        role: role || "member",
        status: "invited",
      });
    }

    // 6. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${cleanEmail}`,
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