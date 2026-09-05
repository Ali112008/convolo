"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TargetLanguage } from "@/lib/types";

const localeByLanguage: Record<TargetLanguage, string> = {
  spanish: "es-ES",
  french: "fr-FR",
  german: "de-DE",
  japanese: "ja-JP",
};

interface SpeechButtonProps {
  text: string;
  language: TargetLanguage;
  label?: string;
  className?: string;
  rate?: number;
}

/**
 * Progressive enhancement for device-provided text-to-speech. It never sends a
 * phrase to a third party, and leaves the normal reading path intact if the
 * browser does not provide speech synthesis.
 */
export function SpeechButton({
  text,
  language,
  label = "Listen",
  className = "speak-button",
  rate = 0.86,
}: SpeechButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState("");
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function playPhrase() {
    if (!("speechSynthesis" in window)) {
      setNotice("Audio playback is not available in this browser.");
      return;
    }

    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      activeUtterance.current = null;
      setSpeaking(false);
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeByLanguage[language];
    utterance.rate = rate;
    utterance.onend = () => {
      activeUtterance.current = null;
      setSpeaking(false);
    };
    utterance.onerror = () => {
      activeUtterance.current = null;
      setSpeaking(false);
      setNotice("Your device could not play this voice. Try another installed voice.");
    };
    activeUtterance.current = utterance;
    setNotice("");
    setSpeaking(true);
    synth.speak(utterance);
  }

  return (
    <span className="speech-control">
      <button
        className={`${className}${speaking ? " speech-button-playing" : ""}`}
        type="button"
        onClick={playPhrase}
        aria-label={speaking ? "Stop audio" : label}
        aria-pressed={speaking}
      >
        {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
        {speaking ? "Stop" : label}
      </button>
      {notice && <span className="sr-only" role="status">{notice}</span>}
    </span>
  );
}
