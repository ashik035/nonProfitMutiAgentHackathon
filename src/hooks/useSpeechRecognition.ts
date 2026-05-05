import { useState, useRef, useCallback } from 'react';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionState {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecognitionState>({
    isRecording: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported:
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition is not supported in this browser. Please use Chrome.',
      }));
      return;
    }

    finalTranscriptRef.current = '';
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      finalTranscriptRef.current = final;
      setState(prev => ({
        ...prev,
        transcript: final,
        interimTranscript: interim,
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setState(prev => ({
        ...prev,
        error: `Recording error: ${event.error}`,
        isRecording: false,
      }));
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      let message = 'Could not start speech recognition.';
      if (error.name === 'NotAllowedError') {
        message = 'Microphone access denied. If viewing in a preview iframe, try opening the published app directly. You can also type your note manually below.';
      } else if (error.name === 'NotFoundError') {
        message = 'No microphone found. Please connect a microphone or type your note manually below.';
      } else if (error.name === 'NotReadableError') {
        message = 'Microphone is in use by another application. Close other apps using the mic, or type your note manually below.';
      }
      setState(prev => ({
        ...prev,
        error: message,
        isRecording: false,
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isRecording: false,
      interimTranscript: '',
    }));
    return finalTranscriptRef.current;
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return { ...state, startRecording, stopRecording, resetTranscript };
}
