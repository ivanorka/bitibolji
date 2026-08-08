"use client";

import { useEffect, useRef, useState } from "react";

type VoiceProfile = "vlado" | "mirjana";

type PlayerProps = {
  locale?: "hr" | "en";
  title: string;
};

const voiceNames: Record<VoiceProfile, string> = {
  vlado: "Vlado",
  mirjana: "Mirjana",
};

function splitForSpeech(text: string, maxLength = 240) {
  const sentences = text.match(/[^.!?…]+(?:[.!?…]+|$)/gu) ?? [text];
  const chunks: string[] = [];
  let current = "";

  function addWords(value: string) {
    for (const word of value.split(/\s+/u)) {
      if (!word) continue;
      if (current && `${current} ${word}`.length > maxLength) {
        chunks.push(current);
        current = word;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
  }

  for (const sentence of sentences) {
    const clean = sentence.trim();
    if (!clean) continue;
    if (clean.length > maxLength) {
      if (current) chunks.push(current);
      current = "";
      addWords(clean);
    } else if (current && `${current} ${clean}`.length > maxLength) {
      chunks.push(current);
      current = clean;
    } else {
      current = current ? `${current} ${clean}` : clean;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function chooseVoice(profile: VoiceProfile, locale: "hr" | "en") {
  const language = locale === "hr" ? "hr" : "en";
  const voices = window.speechSynthesis.getVoices();
  const matching = voices.filter((voice) => voice.lang.toLocaleLowerCase().startsWith(language));
  const preferred = profile === "vlado"
    ? /srecko|srećko|male|marko|mislav|davor|daniel|david/iu
    : /gabrijela|lana|female|ivana|marija|samantha|victoria/iu;

  return matching.find((voice) => preferred.test(voice.name))
    ?? matching[profile === "vlado" ? 0 : Math.min(1, matching.length - 1)]
    ?? voices.find((voice) => voice.lang.toLocaleLowerCase().startsWith(language))
    ?? null;
}

export function ArticleAudioPlayer({ locale = "hr", title }: PlayerProps) {
  const english = locale === "en";
  const [supported, setSupported] = useState<boolean | null>(null);
  const [activeProfile, setActiveProfile] = useState<VoiceProfile | null>(null);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState("");
  const sessionRef = useRef(0);

  useEffect(() => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const speech = window.speechSynthesis;
    const refreshVoices = () => speech.getVoices();
    refreshVoices();
    speech.addEventListener?.("voiceschanged", refreshVoices);

    return () => {
      sessionRef.current += 1;
      speech.cancel();
      speech.removeEventListener?.("voiceschanged", refreshVoices);
    };
  }, []);

  function stopReading() {
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    setActiveProfile(null);
    setPaused(false);
    setStatus(english ? "Reading stopped." : "Čitanje je zaustavljeno.");
  }

  function speakChunks(chunks: string[], index: number, profile: VoiceProfile, session: number) {
    if (sessionRef.current !== session || index >= chunks.length) {
      if (sessionRef.current === session) {
        setActiveProfile(null);
        setPaused(false);
        setStatus(english ? "Article finished." : "Članak je pročitan.");
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    const voice = chooseVoice(profile, locale);
    utterance.lang = locale === "hr" ? "hr-HR" : "en-US";
    utterance.rate = profile === "vlado" ? 0.94 : 0.97;
    utterance.pitch = profile === "vlado" ? 0.86 : 1.08;
    if (voice) utterance.voice = voice;
    utterance.onend = () => speakChunks(chunks, index + 1, profile, session);
    utterance.onerror = (event) => {
      if (event.error === "canceled" || event.error === "interrupted") return;
      setActiveProfile(null);
      setPaused(false);
      setStatus(english ? "The article could not be played." : "Članak nije moguće reproducirati.");
    };
    window.speechSynthesis.speak(utterance);
  }

  function toggleProfile(profile: VoiceProfile) {
    if (supported !== true) return;
    const speech = window.speechSynthesis;

    if (activeProfile === profile && speech.speaking) {
      if (speech.paused) {
        speech.resume();
        setPaused(false);
        setStatus(english ? `${voiceNames[profile]} is reading.` : `${voiceNames[profile]} čita članak.`);
      } else {
        speech.pause();
        setPaused(true);
        setStatus(english ? "Reading paused." : "Čitanje je pauzirano.");
      }
      return;
    }

    const articleText = document.querySelector<HTMLElement>(".article-content")?.innerText
      .replace(/\s+/gu, " ")
      .trim();
    if (!articleText) {
      setStatus(english ? "Article text was not found." : "Tekst članka nije pronađen.");
      return;
    }

    speech.cancel();
    sessionRef.current += 1;
    const session = sessionRef.current;
    const chunks = splitForSpeech(`${title}. ${articleText}`);
    setActiveProfile(profile);
    setPaused(false);
    setStatus(english ? `${voiceNames[profile]} is reading.` : `${voiceNames[profile]} čita članak.`);
    window.setTimeout(() => speakChunks(chunks, 0, profile, session), 0);
  }

  return (
    <div className="article-audio" aria-label={english ? "Listen to article" : "Poslušaj članak"}>
      <span className="article-audio-label">{english ? "Listen" : "Poslušaj"}</span>
      <div className="article-audio-voices">
        {(["vlado", "mirjana"] as const).map((profile) => {
          const active = activeProfile === profile;
          const icon = active ? (paused ? "▶" : "❚❚") : "🔊";
          const action = active && !paused
            ? (english ? `Pause ${voiceNames[profile]}` : `Pauziraj glas ${voiceNames[profile]}`)
            : (english ? `Listen with ${voiceNames[profile]}` : `Poslušaj glas ${voiceNames[profile]}`);

          return (
            <button
              type="button"
              className={`article-audio-voice${active ? " is-active" : ""}`}
              aria-label={action}
              aria-pressed={active}
              disabled={supported === false}
              key={profile}
              onClick={() => toggleProfile(profile)}
            >
              <span aria-hidden="true">{icon}</span>
              {voiceNames[profile]}
            </button>
          );
        })}
      </div>
      {activeProfile && (
        <button className="article-audio-stop" type="button" onClick={stopReading}>
          {english ? "Stop" : "Zaustavi"}
        </button>
      )}
      {supported === false && <span className="article-audio-status">{english ? "Audio is unavailable in this browser." : "Slušanje nije dostupno u ovom pregledniku."}</span>}
      {supported === true && status && <span className="article-audio-status" aria-live="polite">{status}</span>}
    </div>
  );
}
