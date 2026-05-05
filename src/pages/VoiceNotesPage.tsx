import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Mic,
  CheckCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Check,
  TrendingUp,
  Calendar,
  Users,
  ShieldAlert,
  Tag,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
  demoVoiceNotes,
  demoDonorNames,
  type DonorSignals,
  type VoiceNote,
} from '@/shared/data/nonprofitDemoData';

// ─── AI Signal Extraction ────────────────────────────────────────

async function extractSignals(transcript: string): Promise<DonorSignals> {
  const systemPrompt = `You are a donor intelligence analyst for Brightside Foundation.
A fundraiser recorded a voice note about a donor. Extract key signals and return
ONLY valid JSON with no markdown, no code blocks, no extra text.

Return exactly this structure:
{
  "givingCapacity": "string or null",
  "askTiming": "string or null",
  "interests": "string or null",
  "avoid": "string or null",
  "decisionMakers": "string or null",
  "upgradePotential": {
    "isCandidate": true or false,
    "suggestedAmount": "string or null"
  },
  "summary": "one sentence summary of the most important insight"
}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_completion_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as DonorSignals;
  } catch {
    return {
      givingCapacity: null,
      askTiming: null,
      interests: null,
      avoid:
        transcript.toLowerCase().includes('do not') ||
        transcript.toLowerCase().includes('avoid')
          ? 'See full transcript for sensitivities'
          : null,
      decisionMakers: null,
      upgradePotential: { isCandidate: true, suggestedAmount: null },
      summary: 'AI extraction unavailable — transcript saved. Review manually.',
    };
  }
}

// ─── Suggested Actions ────────────────────────────────────────────

interface SuggestedAction {
  id: string;
  icon: React.ElementType;
  label: string;
  detail: string;
  toastMsg: string;
  href?: string;
  colorClass: string;
}

function deriveSuggestedActions(signals: DonorSignals, donor: string): SuggestedAction[] {
  const actions: SuggestedAction[] = [];

  if (signals.upgradePotential.isCandidate) {
    const amount = signals.upgradePotential.suggestedAmount ?? 'a higher level';
    actions.push({
      id: 'upgrade',
      icon: TrendingUp,
      label: `Flag ${donor} as upgrade candidate`,
      detail: `Add to Donor Pipeline at ${amount}`,
      toastMsg: `✓ ${donor} flagged as upgrade candidate at ${amount} in Donor Pipeline`,
      href: '/donor-pipeline',
      colorClass: 'border-teal-200 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50',
    });
  }

  if (signals.askTiming) {
    actions.push({
      id: 'timing',
      icon: Calendar,
      label: 'Create follow-up task',
      detail: `Schedule outreach: ${signals.askTiming}`,
      toastMsg: `✓ Follow-up task created for ${donor} — ${signals.askTiming}`,
      colorClass: 'border-blue-200 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50',
    });
  }

  if (signals.decisionMakers) {
    actions.push({
      id: 'decision',
      icon: Users,
      label: 'Add co-contact to profile',
      detail: signals.decisionMakers,
      toastMsg: `✓ Co-contact noted on ${donor}'s Salesforce profile`,
      colorClass: 'border-purple-200 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50',
    });
  }

  if (signals.avoid) {
    actions.push({
      id: 'avoid',
      icon: ShieldAlert,
      label: 'Add sensitivity flag to CRM',
      detail: signals.avoid,
      toastMsg: `✓ Sensitivity flag saved on ${donor}'s record in Salesforce`,
      colorClass: 'border-red-200 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50',
    });
  }

  if (signals.interests) {
    actions.push({
      id: 'interests',
      icon: Tag,
      label: 'Tag interests in Salesforce',
      detail: signals.interests,
      toastMsg: `✓ Interests tagged on ${donor}'s Salesforce record`,
      colorClass: 'border-green-200 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50',
    });
  }

  if (signals.givingCapacity) {
    actions.push({
      id: 'capacity',
      icon: Zap,
      label: 'Update giving capacity estimate',
      detail: signals.givingCapacity,
      toastMsg: `✓ Giving capacity updated on ${donor}'s profile`,
      colorClass: 'border-amber-200 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50',
    });
  }

  return actions;
}

// ─── Helpers ─────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function countNonNullSignals(signals: DonorSignals): number {
  let count = 0;
  if (signals.givingCapacity) count++;
  if (signals.askTiming) count++;
  if (signals.interests) count++;
  if (signals.avoid) count++;
  if (signals.decisionMakers) count++;
  if (signals.upgradePotential.isCandidate) count++;
  return count;
}

// ─── Signal Cards ─────────────────────────────────────────────────

function SignalCards({ signals }: { signals: DonorSignals }) {
  return (
    <div className="space-y-2">
      {signals.givingCapacity && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">Giving Capacity</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">{signals.givingCapacity}</p>
        </div>
      )}
      {signals.askTiming && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-0.5">Best Ask Timing</p>
          <p className="text-xs text-blue-700 dark:text-blue-400">{signals.askTiming}</p>
        </div>
      )}
      {signals.interests && (
        <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-2">
          <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-0.5">Interests & Motivations</p>
          <p className="text-xs text-green-700 dark:text-green-400">{signals.interests}</p>
        </div>
      )}
      {signals.avoid && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2">
          <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-0.5">Avoid / Sensitivities</p>
          <p className="text-xs text-red-700 dark:text-red-400">{signals.avoid}</p>
        </div>
      )}
      {signals.decisionMakers && (
        <div className="rounded-md bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 px-3 py-2">
          <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-0.5">Decision Makers</p>
          <p className="text-xs text-purple-700 dark:text-purple-400">{signals.decisionMakers}</p>
        </div>
      )}
      <div className={`rounded-md px-3 py-2 border ${signals.upgradePotential.isCandidate ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800' : 'bg-muted border-border'}`}>
        <p className={`text-xs font-semibold mb-0.5 ${signals.upgradePotential.isCandidate ? 'text-teal-800 dark:text-teal-300' : 'text-muted-foreground'}`}>Upgrade Potential</p>
        <p className={`text-xs ${signals.upgradePotential.isCandidate ? 'text-teal-700 dark:text-teal-400' : 'text-muted-foreground'}`}>
          {signals.upgradePotential.isCandidate
            ? `Yes — ${signals.upgradePotential.suggestedAmount ?? 'amount TBD'}`
            : 'Not at this time'}
        </p>
      </div>
    </div>
  );
}

// ─── Recent Note Card ─────────────────────────────────────────────

function RecentNoteCard({ note, isNew }: { note: VoiceNote; isNew?: boolean }) {
  const [expanded, setExpanded] = useState(isNew ?? false);

  return (
    <Card className={`text-sm transition-all ${isNew ? 'ring-2 ring-green-400' : ''}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold">{note.donorName}</p>
                {isNew && <Badge className="text-[10px] bg-green-500 text-white px-1.5 py-0">New</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo(note.recordedAt)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">{formatDuration(note.durationSeconds)}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {note.transcript.slice(0, 120)}...
        </p>
        <p className="text-xs text-muted-foreground">
          Signals extracted: {countNonNullSignals(note.signals)}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs w-full"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3 mr-1" /> Collapse</>
          ) : (
            <><ChevronDown className="h-3 w-3 mr-1" /> View Full Note</>
          )}
        </Button>
        {expanded && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <p className="text-xs font-semibold mb-1">Full Transcript</p>
              <Textarea
                value={note.transcript}
                readOnly
                className="text-xs min-h-[100px] resize-none"
              />
            </div>
            <SignalCards signals={note.signals} />
            <div className="rounded-md bg-muted px-3 py-2 flex gap-2 items-start">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">{note.signals.summary}</p>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Saved to Salesforce ✓</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Donor Select ─────────────────────────────────────────────────

function DonorSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value || 'Select a donor...'}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search donors..." />
          <CommandList>
            <CommandEmpty>No donor found.</CommandEmpty>
            <CommandGroup>
              {demoDonorNames.map((name) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={(current) => {
                    onChange(current === value ? '' : current);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === name ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

type RecorderState = 'idle' | 'recording' | 'processing' | 'results' | 'saved';

export default function VoiceNotesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDonor = searchParams.get('donor');

  // Notes list — mutable in-memory; new saves prepend here
  const [notes, setNotes] = useState<VoiceNote[]>([...demoVoiceNotes]);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);

  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [selectedDonor, setSelectedDonor] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [extractedSignals, setExtractedSignals] = useState<DonorSignals | null>(null);
  const [savedDonorName, setSavedDonorName] = useState('');
  const [progress, setProgress] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [manualText, setManualText] = useState('');
  // Track which suggested actions have been applied
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());
  const [suggestedActions, setSuggestedActions] = useState<ReturnType<typeof deriveSuggestedActions>>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    isRecording,
    transcript,
    interimTranscript,
    isSupported,
    error: speechError,
    startRecording,
    stopRecording,
    resetTranscript,
  } = useSpeechRecognition();

  // Pre-select donor from URL param
  useEffect(() => {
    if (preselectedDonor && demoDonorNames.includes(preselectedDonor)) {
      setSelectedDonor(preselectedDonor);
    }
  }, [preselectedDonor]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setTimerSeconds(0);
      timerRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Processing progress animation
  useEffect(() => {
    if (recorderState === 'processing') {
      setProgress(0);
      const start = Date.now();
      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min((elapsed / 3000) * 100, 100);
        setProgress(pct);
        if (pct >= 100 && progressRef.current) {
          clearInterval(progressRef.current);
          progressRef.current = null;
        }
      }, 50);
    }
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [recorderState]);

  const handleStartRecording = () => {
    resetTranscript();
    startRecording();
    setRecorderState('recording');
  };

  const handleStopRecording = () => {
    const captured = stopRecording();
    const text = captured || transcript;
    setFinalTranscript(text);
    setRecorderState('processing');

    setTimeout(async () => {
      const signals = await extractSignals(text);
      setExtractedSignals(signals);
      setSuggestedActions(deriveSuggestedActions(signals, selectedDonor));
      setAppliedActions(new Set());
      setRecorderState('results');
    }, 3000);
  };

  const handleAnalyzeManual = () => {
    if (!manualText.trim()) return;
    setFinalTranscript(manualText);
    setRecorderState('processing');
    setTimeout(async () => {
      const signals = await extractSignals(manualText);
      setExtractedSignals(signals);
      setSuggestedActions(deriveSuggestedActions(signals, selectedDonor));
      setAppliedActions(new Set());
      setRecorderState('results');
    }, 3000);
  };

  const handleApplyAction = (action: SuggestedAction) => {
    setAppliedActions((prev) => new Set(prev).add(action.id));
    toast.success(action.toastMsg);
    if (action.href) {
      setTimeout(() => navigate(action.href!), 800);
    }
  };

  const handleSave = () => {
    if (!extractedSignals) return;
    const id = `vn-${Date.now()}`;
    const newNote: VoiceNote = {
      id,
      donorName: selectedDonor,
      recordedAt: new Date(),
      durationSeconds: timerSeconds > 0 ? timerSeconds : Math.max(10, Math.ceil(finalTranscript.length / 15)),
      transcript: finalTranscript,
      signals: extractedSignals,
    };
    // Prepend to the notes list — shows up at top of feed immediately
    setNotes((prev) => [newNote, ...prev]);
    setNewNoteId(id);
    setSavedDonorName(selectedDonor);
    setRecorderState('saved');
  };

  const handleRerecord = () => {
    resetTranscript();
    setFinalTranscript('');
    setExtractedSignals(null);
    setSuggestedActions([]);
    setAppliedActions(new Set());
    setTimerSeconds(0);
    setManualText('');
    setRecorderState('idle');
  };

  const handleDiscard = () => {
    handleRerecord();
    setSelectedDonor('');
  };

  const handleRecordAnother = () => {
    handleRerecord();
    setSelectedDonor('');
    setSavedDonorName('');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Voice Notes</h1>
        <p className="text-sm text-muted-foreground">
          Brightside Foundation · Record donor insights directly from your voice — no typing required
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Notes Recorded This Month', value: String(notes.length) },
          { label: 'Donors Updated', value: String(new Set(notes.map((n) => n.donorName)).size) },
          { label: 'Avg Note Length', value: '1.4 min' },
          { label: 'Signals Extracted', value: String(notes.reduce((acc, n) => acc + countNonNullSignals(n.signals), 0)) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — Recorder (60%) */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* IDLE STATE */}
              {recorderState === 'idle' && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-5 rounded-full bg-muted">
                      <Mic className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Record a donor note</h2>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Select a donor, then tap record. Speak naturally — the AI will extract key signals automatically.
                    </p>
                  </div>

                  {!isSupported && (
                    <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-300 text-sm">
                        Voice recording works best in Chrome on desktop. On other browsers you can type your note manually below.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select donor</label>
                    <DonorSelect value={selectedDonor} onChange={setSelectedDonor} />
                  </div>

                  {isSupported ? (
                    <button
                      disabled={!selectedDonor}
                      onClick={handleStartRecording}
                      className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all
                        ${selectedDonor
                          ? 'bg-red-500 hover:bg-red-600 cursor-pointer shadow-lg'
                          : 'bg-muted cursor-not-allowed opacity-50'
                        }`}
                    >
                      <Mic className="h-8 w-8 text-white" />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your donor note here..."
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <Button
                        onClick={handleAnalyzeManual}
                        disabled={!selectedDonor || !manualText.trim()}
                        className="w-full"
                      >
                        Analyze Note
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* RECORDING STATE */}
              {recorderState === 'recording' && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div
                      className="p-5 rounded-full bg-red-100 dark:bg-red-950/40"
                      style={{ animation: 'pulse-recording 1.5s ease-in-out infinite' }}
                    >
                      <Mic className="h-16 w-16 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold">Listening...</h2>
                    <p className="text-sm text-muted-foreground font-mono">{formatDuration(timerSeconds)}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Live transcript</label>
                    <div className="relative min-h-[120px] rounded-md border bg-muted/30 p-3 text-sm">
                      <span>{transcript}</span>
                      <span className="text-muted-foreground">{interimTranscript}</span>
                      {!transcript && !interimTranscript && (
                        <span className="text-muted-foreground italic">Waiting for speech...</span>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleStopRecording} className="w-full bg-red-500 hover:bg-red-600">
                    Stop Recording
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Speak clearly — your words appear above in real time
                  </p>
                </div>
              )}

              {/* PROCESSING STATE */}
              {recorderState === 'processing' && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    <h2 className="text-xl font-semibold">Extracting donor signals...</h2>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Transcript</label>
                    <Textarea value={finalTranscript} readOnly className="min-h-[100px] resize-none text-sm" />
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    Analyzing with AI — this takes about 5 seconds
                  </p>
                </div>
              )}

              {/* RESULTS STATE */}
              {recorderState === 'results' && extractedSignals && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <h2 className="text-xl font-semibold">Note ready for {selectedDonor}</h2>
                  </div>

                  {/* Transcript + Signals side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Full Transcript</label>
                      <Textarea value={finalTranscript} readOnly className="min-h-[200px] resize-none text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Extracted Signals</label>
                      <SignalCards signals={extractedSignals} />
                    </div>
                  </div>

                  {/* AI summary */}
                  <div className="rounded-md bg-muted px-4 py-3 flex gap-2 items-start">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{extractedSignals.summary}</p>
                  </div>

                  {/* ── Suggested Actions ── */}
                  {suggestedActions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <p className="text-sm font-semibold">Suggested Actions</p>
                        <Badge variant="secondary" className="text-xs">
                          {appliedActions.size}/{suggestedActions.length} applied
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {suggestedActions.map((action) => {
                          const done = appliedActions.has(action.id);
                          const Icon = action.icon;
                          return (
                            <div
                              key={action.id}
                              className={`rounded-md border px-3 py-2.5 flex items-start gap-3 transition-all ${
                                done
                                  ? 'border-green-200 bg-green-50 dark:bg-green-950/20 opacity-70'
                                  : action.colorClass
                              }`}
                            >
                              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${done ? 'text-green-600' : 'text-foreground/70'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold ${done ? 'line-through text-muted-foreground' : ''}`}>
                                  {action.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{action.detail}</p>
                              </div>
                              <Button
                                size="sm"
                                variant={done ? 'ghost' : 'outline'}
                                className={`h-7 text-xs shrink-0 ${done ? 'text-green-600 cursor-default' : ''}`}
                                disabled={done}
                                onClick={() => !done && handleApplyAction(action)}
                              >
                                {done ? (
                                  <><Check className="h-3 w-3 mr-1" /> Done</>
                                ) : action.href ? (
                                  'Apply & View'
                                ) : (
                                  'Apply'
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      Save to Donor Record
                    </Button>
                    <Button variant="outline" onClick={handleRerecord}>
                      Re-record
                    </Button>
                    <Button variant="ghost" onClick={handleDiscard}>
                      Discard
                    </Button>
                  </div>
                </div>
              )}

              {/* SAVED STATE */}
              {recorderState === 'saved' && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-8 space-y-4 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <h2 className="text-xl font-semibold text-green-800 dark:text-green-300">
                    ✓ Note saved for {savedDonorName}
                  </h2>
                  <p className="text-sm text-green-700 dark:text-green-400 max-w-sm mx-auto">
                    Transcript and signals have been added to their profile. The note now appears in the Recent Notes feed on the right.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button onClick={handleRecordAnother} className="bg-green-600 hover:bg-green-700">
                      Record Another Note
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/donor-pipeline')}>
                      View Donor Pipeline
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — Recent Notes (40%) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Notes</CardTitle>
                <Badge variant="secondary">{notes.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {notes.map((note) => (
                <RecentNoteCard key={note.id} note={note} isNew={note.id === newNoteId} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pulse animation for recording indicator */}
      <style>{`
        @keyframes pulse-recording {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
