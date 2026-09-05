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
const START_CHECK_DELAY_MS = 1_500;

interface SpeechButtonProps {
  text: string;
  language: TargetLanguage;
  label?: string;
  className?: string;
  rate?: number;
}

function browserCanSpeak(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

/** Prefer an installed voice for the selected path, but let the browser fall
 * back to its default voice when that language pack is not installed. */
function findPreferredVoice(
  synth: SpeechSynthesis,
  locale: string
): SpeechSynthesisVoice | undefined {
  const voices = synth.getVoices();
  const normalizedLocale = locale.toLowerCase();
  const languageCode = normalizedLocale.split("-")[0];

  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalizedLocale) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(`${languageCode}-`)) ??
    voices.find((voice) => voice.lang.toLowerCase() === languageCode)
  );
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
  const startCheckTimer = useRef<number | null>(null);

  function clearStartCheck() {
    if (startCheckTimer.current) {
      window.clearTimeout(startCheckTimer.current);
      startCheckTimer.current = null;
    }
  }

  useEffect(() => {
    if (!browserCanSpeak()) return;

    // Chrome-family browsers can populate voices asynchronously. Touching the
    // list after mount initializes that process before the learner clicks.
    window.speechSynthesis.getVoices();

    return () => {
      clearStartCheck();
      // Do not cancel speech started by another audio control after this one
      // unmounts. Only this button's active utterance may be stopped here.
      if (activeUtterance.current) {
        window.speechSynthesis.cancel();
        activeUtterance.current = null;
      }
    };
  }, []);

  function stopPhrase() {
    if (!browserCanSpeak()) return;
    clearStartCheck();
    window.speechSynthesis.cancel();
    activeUtterance.current = null;
    setSpeaking(false);
    setNotice("");
  }

  function playPhrase() {
    if (!browserCanSpeak()) {
      setNotice("Audio playback is not available in this browser.");
      return;
    }

    const synth = window.speechSynthesis;
    if (speaking || activeUtterance.current) {
      stopPhrase();
      return;
    }

    try {
      // Calling cancel before every first utterance can leave some mobile and
      // embedded browsers silent. Clear the global queue only when one exists.
      if (synth.speaking || synth.pending || synth.paused) {
        synth.cancel();
      }
      synth.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      const locale = localeByLanguage[language];
      utterance.lang = locale;
      utterance.rate = Math.min(2, Math.max(0.5, rate));
      const preferredVoice = findPreferredVoice(synth, locale);
      if (preferredVoice) utterance.voice = preferredVoice;

      let started = false;
      utterance.onstart = () => {
        started = true;
        clearStartCheck();
        setSpeaking(true);
        setNotice("");
      };
      utterance.onend = () => {
        clearStartCheck();
        if (activeUtterance.current === utterance) {
          activeUtterance.current = null;
          setSpeaking(false);
        }
      };
      utterance.onerror = (event) => {
        clearStartCheck();
        if (activeUtterance.current === utterance) {
          activeUtterance.current = null;
          setSpeaking(false);
        }
        // A deliberate cancel or a second Listen click is not an audio error.
        if (event.error !== "canceled" && event.error !== "interrupted") {
          setNotice("This device could not start a voice. Check its text-to-speech voices, then try again.");
        }
      };

      activeUtterance.current = utterance;
      setNotice("");
      setSpeaking(true);
      synth.speak(utterance);
      // Resume handles a speech engine that a browser left paused after the
      // app was backgrounded or a previous utterance was interrupted.
      synth.resume();

      startCheckTimer.current = window.setTimeout(() => {
        if (
          activeUtterance.current === utterance &&
          !started &&
          !synth.speaking &&
          !synth.pending
        ) {
          activeUtterance.current = null;
          setSpeaking(false);
          setNotice("Your browser did not start a voice. Check device sound and text-to-speech settings, then try again.");
        }
      }, START_CHECK_DELAY_MS);
    } catch {
      clearStartCheck();
      activeUtterance.current = null;
      setSpeaking(false);
      setNotice("This browser could not prepare audio playback. Try a current browser with text-to-speech enabled.");
    }
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
      {notice && <span className="speech-notice" role="status">{notice}</span>}
    </span>
  );
}
