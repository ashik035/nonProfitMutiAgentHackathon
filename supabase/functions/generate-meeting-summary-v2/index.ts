/**
 * Generate Meeting Summary V2 Edge Function
 *
 * Two modes:
 * 1. { meeting_id, force? } — summarize stored meeting transcript (existing)
 * 2. { transcript } — paste-in demo for Meeting Summarizer agent (Lovable Cloud)
 *
 * Uses shared AI routing + Lovable gateway fallback (claude-sonnet-4-20250514).
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { chatCompletion, logUsage } from '../_shared/ai-provider-routing.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MODEL = 'claude-sonnet-4-20250514'
const MAX_INPUT_CHARS = 12000
const LOVABLE_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions'

const AGENT_SYSTEM_PROMPT = `You are an expert meeting minutes writer for Brightside Foundation, a nonprofit organization in Boston.

Given a board or staff meeting transcript, produce structured minutes as valid JSON only — no markdown fences, no commentary outside the JSON object.

Your response must match this exact structure:
{
  "executive_summary": "Exactly three complete sentences summarizing the meeting outcomes.",
  "decisions": ["Decision 1", "Decision 2"],
  "action_items": [
    { "task": "Description of the action", "owner": "Person name or null", "deadline": "Date or timeframe or null" }
  ],
  "attendance": ["Name (Role) — present", "Name (Role) — absent"],
  "key_discussion_points": ["Topic discussed without a formal decision"]
}

Rules:
- executive_summary must be exactly three sentences.
- decisions: only formal decisions approved or agreed by the board.
- action_items: extract every assigned task with owner and deadline when stated; use null when unknown.
- attendance: infer from roll call, introductions, or speaker presence; note absent members if mentioned.
- key_discussion_points: substantive discussion that did not result in a recorded decision.
- Be factual; use names from the transcript; flag unclear items with [UNCLEAR] in the relevant field.
- Return only the JSON object.`

const MEETING_DB_SYSTEM_PROMPT = `You are a meeting analyst. Produce a structured summary of the meeting transcript provided. Your response must be valid JSON with the following structure:

{
  "executive_summary": "A concise 2-4 sentence summary of the meeting",
  "key_decisions": ["Decision 1", "Decision 2"],
  "action_items": [{"task": "description", "assignee": "person or null", "deadline": "date or null"}],
  "follow_up_topics": ["Topic 1", "Topic 2"],
  "participants_mentioned": ["Name 1", "Name 2"],
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "meeting_effectiveness_score": 1-10
}

Be thorough but concise. Extract all key decisions, action items, and follow-up topics. Rate meeting effectiveness based on clarity of outcomes, participation, and actionability.`

function parseJsonContent(content: string): Record<string, unknown> {
  const cleaned = content.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned) as Record<string, unknown>
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>
    }
    throw new Error('Failed to parse AI response as JSON')
  }
}

async function callLovableGateway(
  transcript: string,
  systemPrompt: string
): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  if (!lovableKey) {
    throw new Error('LOVABLE_API_KEY is not configured')
  }

  const response = await fetch(LOVABLE_GATEWAY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_completion_tokens: 3000,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this meeting transcript and produce structured minutes:\n\n${transcript}`,
        },
      ],
    }),
  })

  if (response.status === 429) {
    throw new Error('Rate limit exceeded — please try again shortly.')
  }
  if (response.status === 402) {
    throw new Error('AI credits exhausted — please add funds in Lovable.')
  }
  if (!response.ok) {
    const errorText = await response.text()
    console.error('[generate-meeting-summary-v2] Lovable gateway error:', response.status, errorText)
    throw new Error('AI service error — please try again.')
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  if (!content) {
    throw new Error('Empty response from AI service')
  }

  return {
    content,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  }
}

async function summarizeTranscriptText(
  supabaseClient: ReturnType<typeof createClient>,
  transcript: string,
  systemPrompt: string,
  functionName: string
): Promise<{ summary: Record<string, unknown>; inputTokens: number; outputTokens: number }> {
  const truncated = transcript.slice(0, MAX_INPUT_CHARS)
  const userMessage = `Analyze this meeting transcript and produce structured minutes:\n\n${truncated}`

  try {
    const { data: sonnetModel } = await supabaseClient
      .from('ai_models')
      .select('id')
      .eq('model_id', MODEL)
      .eq('enabled', true)
      .maybeSingle()

    const result = await chatCompletion(
      supabaseClient,
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 3000,
        model: MODEL,
      },
      sonnetModel?.id
    )

    return {
      summary: parseJsonContent(result.content),
      inputTokens: result.input_tokens,
      outputTokens: result.output_tokens,
    }
  } catch (routingError) {
    console.warn('[generate-meeting-summary-v2] chatCompletion failed, using Lovable gateway:', routingError)
    const result = await callLovableGateway(truncated, systemPrompt)
    return {
      summary: parseJsonContent(result.content),
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body = await req.json()
    const pastedTranscript =
      typeof body?.transcript === 'string' ? body.transcript.trim() : ''

    // ── Agent demo mode: raw transcript paste (Meeting Summarizer UI) ──
    if (pastedTranscript) {
      const { summary, inputTokens, outputTokens } = await summarizeTranscriptText(
        supabaseClient,
        pastedTranscript,
        AGENT_SYSTEM_PROMPT,
        'generate-meeting-summary-v2'
      )

      await logUsage(
        supabaseClient,
        null,
        null,
        'generate-meeting-summary-v2',
        inputTokens,
        outputTokens,
        0,
        0
      )

      return new Response(JSON.stringify(summary), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { meeting_id, force } = body ?? {}

    if (!meeting_id) {
      return new Response(
        JSON.stringify({ error: 'meeting_id or transcript is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Fetch meeting
    const { data: meeting, error: meetingError } = await supabaseClient
      .from('meetings')
      .select('id, title, ai_summary, summary, start_time, description')
      .eq('id', meeting_id)
      .single()

    if (meetingError || !meeting) {
      return new Response(
        JSON.stringify({ error: 'Meeting not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (meeting.ai_summary && !force) {
      return new Response(
        JSON.stringify({
          message: 'Summary already exists. Use force=true to regenerate.',
          executive_summary: meeting.ai_summary,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    let transcriptContent = ''
    const { data: transcriptRow } = await supabaseClient
      .from('meeting_transcripts')
      .select('content')
      .eq('meeting_id', meeting_id)
      .maybeSingle()

    transcriptContent = transcriptRow?.content || ''

    if (!transcriptContent) {
      const { data: files } = await supabaseClient
        .from('zoom_files')
        .select('transcript_text')
        .eq('meeting_id', meeting_id)
        .not('transcript_text', 'is', null)
        .limit(1)
        .maybeSingle()

      transcriptContent = files?.transcript_text || ''
    }

    if (!transcriptContent) {
      return new Response(
        JSON.stringify({ error: 'No transcript content found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { summary, inputTokens, outputTokens } = await summarizeTranscriptText(
      supabaseClient,
      transcriptContent,
      MEETING_DB_SYSTEM_PROMPT,
      'generate-meeting-summary-v2'
    )

    const { error: updateError } = await supabaseClient
      .from('meetings')
      .update({
        ai_summary: String(summary.executive_summary ?? ''),
        summary: JSON.stringify(summary),
      })
      .eq('id', meeting_id)

    if (updateError) {
      console.error('Error updating meeting summary:', updateError)
    }

    await logUsage(
      supabaseClient,
      null,
      null,
      'generate-meeting-summary-v2',
      inputTokens,
      outputTokens,
      0,
      0
    )

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: unknown) {
    console.error('Generate meeting summary v2 error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message.includes('Rate limit') ? 429 : 500
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
    )
  }
})
