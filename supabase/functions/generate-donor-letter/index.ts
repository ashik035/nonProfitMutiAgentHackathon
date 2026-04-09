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

    const { donor } = body
    if (!donor?.name) {
      return new Response(
        JSON.stringify({ error: 'Donor data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `You are Sarah Chen, Executive Director of Brightside Foundation. Write a warm, personalized donor acknowledgment letter.

Rules:
- Use the donor's first name after "Dear"
- Reference the specific gift amount, date, and fund designation
- Include a personal touch from the contact notes if provided
- Add an impact statement that matches the fund they gave to
- Keep it to 3-4 paragraphs, warm but professional
- Sign as "Sarah Chen, Executive Director, Brightside Foundation"
- Do NOT include a date or address header — just the letter body starting with "Dear..."
- Do NOT use placeholder brackets like [date] — use real details provided`

    const userPrompt = `Write an acknowledgment letter for this donor:

Name: ${donor.name}
Most Recent Gift: ${donor.lastGiftAmount || donor.currentGiving}
Gift Date: ${donor.lastGiftDate || 'March 2026'}
Fund Designation: ${donor.fundDesignation || 'General Operating'}
Total Lifetime Giving: ${donor.totalGiving || donor.currentGiving}
Giving History: ${donor.givingHistory || 'Regular annual donor'}
Contact Notes: ${donor.contactNotes || 'No specific notes'}
Volunteer/Event History: ${donor.volunteerHistory || 'None noted'}
Current Giving Level: ${donor.currentGiving}
Target Giving Level: ${donor.targetGiving}`

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
    const letter = result.choices?.[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ letter }),
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
