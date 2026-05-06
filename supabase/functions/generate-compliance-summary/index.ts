const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let body
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { grant } = body
    if (!grant?.name) {
      return new Response(
        JSON.stringify({ error: 'Grant data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `You are a nonprofit grant compliance analyst at Brightside Foundation. Generate a concise, structured compliance summary for an active grant. Use clear section headers with ## markdown. Be specific about numbers and dates. Write in a professional, action-oriented tone appropriate for a grant manager.`

    const userPrompt = `Generate a compliance summary for this active grant:

Grant Name: ${grant.name}
Funder: ${grant.funder}
Award Amount: $${grant.amount?.toLocaleString() ?? grant.amount}
Fund Utilization: ${grant.utilized ?? grant.utilization}%
Days Until Next Deadline: ${grant.daysUntilDeadline}
Deadline Date: ${grant.deadlineDate}
Current Status: ${grant.status}
Next Milestone: ${grant.nextMilestone ?? 'Not specified'}

Write a compliance summary with these four sections:
## Compliance Status
[1-2 sentences on overall compliance health and any risk flags]

## Fund Utilization
[1-2 sentences on spending pace — is it on track, underspent, or at risk of over-utilization?]

## Upcoming Deadlines
[Bullet list of what is due, by when, and urgency level]

## Required Actions
[Bullet list of 2-4 specific actions the grant manager should take now]

Be specific. Use the actual numbers and dates provided.`

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      const status = response.status
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again shortly.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      const errText = await response.text()
      console.error('AI gateway error:', status, errText)
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const result = await response.json()
    const summary = result.choices?.[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ summary }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
