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

    const { grant, programs, section } = body
    if (!grant?.name || !section) {
      return new Response(
        JSON.stringify({ error: 'Grant and section are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `You are an expert nonprofit grant writer. Generate professional grant writing content based on the organization's real program data. Write in a warm but credible tone appropriate for foundation funders. Be specific — use the actual numbers and outcomes provided.`

    const programDetails = programs && programs.length > 0
      ? programs.map((p: {
          name: string;
          description: string;
          metrics: {
            beneficiaryCount: number;
            budgetUsed: number;
            budgetTotal: number;
            outcomesAchieved: number;
            outcomesTarget: number;
            volunteerHours: number;
          };
        }) => `
Program: ${p.name}
Description: ${p.description}
Beneficiaries Served: ${p.metrics.beneficiaryCount}
Budget: $${p.metrics.budgetUsed.toLocaleString()} utilized of $${p.metrics.budgetTotal.toLocaleString()} total
Outcomes: ${p.metrics.outcomesAchieved} of ${p.metrics.outcomesTarget} targets achieved
Volunteer Hours: ${p.metrics.volunteerHours}`).join('\n')
      : 'No specific programs selected — write based on Brightside Foundation\'s general mission.'

    const userPrompt = `Write the "${section}" section for a grant application to ${grant.funder} for the "${grant.name}" grant ($${grant.amount?.toLocaleString() ?? grant.amount}).

Organization: Brightside Foundation
Grant: ${grant.name}
Funder: ${grant.funder}
Award Amount: $${grant.amount?.toLocaleString() ?? grant.amount}
Fund Utilization: ${grant.utilized ?? grant.utilization}%

Programs to include:
${programDetails}

Write 2-4 paragraphs of polished grant writing prose for the "${section}" section. Do not use bullet points or headers — write in flowing paragraphs. Use the actual data provided. Make it compelling and specific.`

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        max_completion_tokens: 1200,
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
    const draft = result.choices?.[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ draft }),
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
