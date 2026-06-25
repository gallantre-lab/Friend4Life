import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, User, AlertCircle, PlayCircle, PauseCircle } from "lucide-react";

interface VoiceCompanionViewProps {
  onClose: () => void;
  onSendSpeech: (text: string) => void;
  lastReplyText: string;
  isBlissSpeaking: boolean;
  isBlissReplying: boolean;
  muteVoice: boolean;
  setMuteVoice: (mute: boolean) => void;
  speakText: (text: string) => void;
  isBlessyPaused: boolean;
  onTogglePauseBlessy: () => void;
  stopSpeaking?: () => void;
}

export default function VoiceCompanionView({
  onClose,
  onSendSpeech,
  lastReplyText,
  isBlissSpeaking,
  isBlissReplying,
  muteVoice,
  setMuteVoice,
  speakText,
  isBlessyPaused,
  onTogglePauseBlessy,
  stopSpeaking
}: VoiceCompanionViewProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Your web browser does not support local Speech Recognition API. You can still input text inside the main chat tab!");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setErrorMsg("");
    };

    rec.onresult = (event: any) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript + " ";
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      if (finalStr) {
        setTranscript(prev => prev + finalStr);
      }
      setInterimTranscript(interimStr);
    };

    rec.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      if (e.error === "not-allowed") {
        setErrorMsg("Microphone permission denied. Go to browser settings to unlock.");
      } else {
        setErrorMsg(`Speech detector: ${e.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    // Clean up recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isBlessyPaused) {
      setErrorMsg("Blessy is currently paused. Resume her to enable voice commands!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      setInterimTranscript("");
      try {
        // Stop speech synthesis if talking so we don't listen to ourselves
        if (stopSpeaking) {
          stopSpeaking();
        }
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendSpokenText = () => {
    const textToSend = (transcript + interimTranscript).trim();
    if (textToSend) {
      onSendSpeech(textToSend);
      setTranscript("");
      setInterimTranscript("");
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  // Re-read Bliss's last word if requested
  const handleReplayVoice = () => {
    if (isBlessyPaused) {
      setErrorMsg("Blessy is paused. Resume her to repeat words!");
      return;
    }
    if (lastReplyText) {
      speakText(lastReplyText);
    }
  };

  return (
    <div id="voice-companion-overlay" className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6 text-white font-sans">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">Bliss Voice Lounge</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Pause / Resume Blessy */}
          <button
            type="button"
            onClick={onTogglePauseBlessy}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              isBlessyPaused 
                ? "bg-amber-900/45 border-amber-600 text-amber-300 animate-pulse font-extrabold" 
                : "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300"
            }`}
            title={isBlessyPaused ? "Resume Blessy" : "Pause Blessy"}
          >
            {isBlessyPaused ? <PlayCircle className="w-4 h-4 text-amber-400" /> : <PauseCircle className="w-4 h-4 text-amber-400 animate-pulse" />}
            <span>{isBlessyPaused ? "Resume Blessy" : "Pause Blessy"}</span>
          </button>

          {/* Mute toggle for Bliss voice responses */}
          <button
            type="button"
            onClick={() => setMuteVoice(!muteVoice)}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              muteVoice 
                ? "bg-red-900/30 border-red-700/50 text-red-400 animate-pulse" 
                : "bg-slate-800 border-slate-700 text-emerald-400"
            }`}
            title={muteVoice ? "Voice response is muted" : "Voice enabled"}
          >
            {muteVoice ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{muteVoice ? "Voice response is Muted" : "Voice response is active"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Center Waveforms / Reactive Visuals */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-lg mx-auto w-full">
        
        {/* Animated Avatar Core */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full bg-emerald-500/20 blur-xl transition-all duration-700 ${
            isBlissReplying ? "scale-150 opacity-90" : isListening ? "scale-125 opacity-70" : "scale-100 opacity-40"
          }`}></div>
          
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all shadow-2xl relative z-10 ${
            isBlissSpeaking 
              ? "border-emerald-400 bg-emerald-950 animate-pulse" 
              : isListening 
                ? "border-amber-400 bg-amber-950" 
                : "border-slate-700 bg-slate-900"
          }`}>
            {isListening ? (
              <Mic className="w-12 h-12 text-amber-400 animate-bounce" />
            ) : isBlissSpeaking ? (
              <Volume2 className="w-12 h-12 text-emerald-400 animate-pulse" />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>

          {/* Glowing Ripple waveforms */}
          {(isListening || isBlissSpeaking) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-emerald-500/40 animate-ping opacity-70 pointer-events-none"></div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-black tracking-tight">
            {isBlissReplying 
              ? "Bliss is forming words..." 
              : isBlissSpeaking 
                ? "Bliss is speaking..." 
                : isListening 
                  ? "Listening to you speak..." 
                  : "Microphone paused"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {isListening 
              ? "Go ahead, talk naturally. Click Stop or Send when done." 
              : "Tap the amber microphone below to speak to Bliss!"}
          </p>
        </div>

        {/* Real-time speech response feedback text box */}
        <div className="w-full bg-slate-900/60 p-4.5 rounded-2xl border border-slate-800 text-center min-h-[90px] flex items-center justify-center font-medium shadow-inner max-h-[160px] overflow-y-auto">
          {errorMsg ? (
            <span className="text-red-400 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" /> {errorMsg}
            </span>
          ) : (transcript || interimTranscript) ? (
            <p className="text-xs text-amber-200">
              "{transcript} <span className="text-amber-300/60">{interimTranscript}</span>"
            </p>
          ) : lastReplyText ? (
            <p className="text-xs text-slate-350 leading-relaxed italic">
              Bliss said: "{lastReplyText.length > 150 ? `${lastReplyText.substring(0, 150)}...` : lastReplyText}"
            </p>
          ) : (
            <span className="text-slate-500 text-xs text-center font-mono uppercase tracking-wider">Sound feedback window</span>
          )}
        </div>

        {/* Audio repeat helper */}
        {lastReplyText && !isBlissSpeaking && !isListening && (
          <button 
            type="button" 
            onClick={handleReplayVoice}
            className="text-slate-400 hover:text-white text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 flex items-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4 text-emerald-400" /> Repeat Bliss's audio line
          </button>
        )}

      </div>

      {/* Bottom control handles */}
      <div className="flex flex-col items-center gap-3 max-w-md mx-auto w-full pb-4">
        
        {/* Dynamic primary microphone trigger */}
        <div className="flex items-center gap-4 w-full">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              isListening
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4 text-slate-950 animate-spin" /> : <Mic className="w-4 h-4 text-emerald-100" />}
            {isListening ? "Pause Listening mic" : "Activate mic & Speak"}
          </button>

          {(transcript || interimTranscript) && (
            <button
              type="button"
              onClick={handleSendSpokenText}
              className="bg-white text-slate-950 hover:bg-slate-100 font-extrabold px-6 py-3.5 rounded-2xl text-xs shadow-md transition cursor-pointer"
            >
              Send text
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4"
        >
          Return to Dashboard list
        </button>
      </div>

    </div>
  );
}
