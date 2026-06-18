import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    (origin.endsWith(".lovableproject.com") ||
      origin.endsWith(".lovable.app") ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:"));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "http://localhost:8080",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-api-key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "3600",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function validateRequestAuth(
  req: Request,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Authorization header required");
  }
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error(error?.message || "Invalid or expired token");
  }
  return user.id;
}

export function parseJsonContent<T>(content: string): T {
  const cleaned = content.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}
