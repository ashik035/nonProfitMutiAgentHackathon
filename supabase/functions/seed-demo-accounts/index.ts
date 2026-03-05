import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const accounts = [
      { email: "ceo@collabai.software", password: "Demo@123", role: "admin", fullName: "CEO Demo" },
      { email: "demo@collabai.software", password: "Demo@123", role: "moderator", fullName: "PM Demo" },
      { email: "ic@collabai.software", password: "Demo@123", role: "user", fullName: "IC Demo" },
    ];

    const results = [];

    for (const account of accounts) {
      // Create user via admin API (auto-confirms email)
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: { full_name: account.fullName },
      });

      if (createError) {
        // If user already exists, try to get their id
        if (createError.message?.includes("already been registered")) {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existing = listData?.users?.find((u: any) => u.email === account.email);
          if (existing) {
            // Ensure role exists
            await supabase.from("user_roles").upsert(
              { user_id: existing.id, role: account.role },
              { onConflict: "user_id,role" }
            );
            results.push({ email: account.email, status: "already_exists", role: account.role });
            continue;
          }
        }
        results.push({ email: account.email, status: "error", error: createError.message });
        continue;
      }

      const userId = userData.user!.id;

      // Insert role
      await supabase.from("user_roles").upsert(
        { user_id: userId, role: account.role },
        { onConflict: "user_id,role" }
      );

      // Ensure profile exists (trigger may handle this, but be safe)
      await supabase.from("profiles").upsert(
        { id: userId, email: account.email, full_name: account.fullName },
        { onConflict: "id" }
      );

      results.push({ email: account.email, status: "created", role: account.role });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
