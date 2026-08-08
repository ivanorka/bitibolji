"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type VoiceProfile = "vlado" | "mirjana";

type PlayerProps = {
  locale?: "hr" | "en";
  partCount: number;
  ready: boolean;
  slug: string;
  title: string;
  version: string;
};

const voiceNames: Record<VoiceProfile, string> = {
  vlado: "Vlado",
  mirjana: "Mirjana",
};

export function ArticleAudioPlayer({ locale = "hr", partCount, ready, slug, title, version }: PlayerProps) {
  const english = locale === "en";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef(0);
  const [activeProfile, setActiveProfile] = useState<VoiceProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState(ready ? "" : (english ? "ElevenLabs voices are being configured." : "ElevenLabs glasovi još se konfiguriraju."));

  function disposeAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.oncanplay = null;
    audio.onended = null;
    audio.onerror = null;
    audio.onplaying = null;
    audio.onwaiting = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audioRef.current = null;
  }

  useEffect(() => () => {
    sessionRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, []);

  function resetPlayer(message: string) {
    sessionRef.current += 1;
    disposeAudio();
    setActiveProfile(null);
    setLoading(false);
    setPaused(false);
    setStatus(message);
  }

  function playPart(profile: VoiceProfile, part: number, session: number) {
    if (sessionRef.current !== session) return;
    disposeAudio();

    const query = new URLSearchParams({ voice: profile, part: String(part), v: version });
    const audio = new Audio(`/api/audio/${locale}/${encodeURIComponent(slug)}?${query}`);
    audio.preload = "auto";
    audioRef.current = audio;
    setLoading(true);
    setPaused(false);
    setStatus(english
      ? `${voiceNames[profile]} is preparing the article${partCount > 1 ? ` · part ${part + 1}/${partCount}` : ""}.`
      : `${voiceNames[profile]} priprema članak${partCount > 1 ? ` · dio ${part + 1}/${partCount}` : ""}.`);

    audio.onplaying = () => {
      if (sessionRef.current !== session) return;
      setLoading(false);
      setPaused(false);
      setStatus(english
        ? `${voiceNames[profile]} is reading${partCount > 1 ? ` · part ${part + 1}/${partCount}` : ""}.`
        : `${voiceNames[profile]} čita članak${partCount > 1 ? ` · dio ${part + 1}/${partCount}` : ""}.`);
    };
    audio.onwaiting = () => {
      if (sessionRef.current === session) setLoading(true);
    };
    audio.oncanplay = () => {
      if (sessionRef.current === session && !audio.paused) setLoading(false);
    };
    audio.onended = () => {
      if (sessionRef.current !== session) return;
      if (part + 1 < partCount) {
        playPart(profile, part + 1, session);
      } else {
        disposeAudio();
        setActiveProfile(null);
        setLoading(false);
        setPaused(false);
        setStatus(english ? "Article finished." : "Članak je pročitan.");
      }
    };
    audio.onerror = () => {
      if (sessionRef.current !== session) return;
      resetPlayer(english
        ? "Audio is not ready yet. Check the ElevenLabs configuration and try again."
        : "Audio još nije spreman. Provjeri ElevenLabs postavke i pokušaj ponovno.");
    };

    void audio.play().catch(() => {
      if (sessionRef.current !== session) return;
      resetPlayer(english ? "Playback could not be started." : "Reprodukciju nije moguće pokrenuti.");
    });
  }

  function toggleProfile(profile: VoiceProfile) {
    if (!ready) {
      setStatus(english ? "ElevenLabs voices are being configured." : "ElevenLabs glasovi još se konfiguriraju.");
      return;
    }

    const currentAudio = audioRef.current;
    if (activeProfile === profile && currentAudio) {
      if (loading) {
        resetPlayer(english ? "Reading stopped." : "Čitanje je zaustavljeno.");
      } else if (currentAudio.paused) {
        void currentAudio.play();
        setPaused(false);
      } else {
        currentAudio.pause();
        setPaused(true);
        setStatus(english ? "Reading paused." : "Čitanje je pauzirano.");
      }
      return;
    }

    sessionRef.current += 1;
    const session = sessionRef.current;
    disposeAudio();
    setActiveProfile(profile);
    playPart(profile, 0, session);
  }

  return (
    <div
      className="article-audio"
      aria-label={`${english ? "Listen to article" : "Poslušaj članak"}: ${title}`}
      data-audio-provider="elevenlabs"
    >
      <div className="article-audio-art" aria-hidden="true">
        <Image
          alt=""
          height={640}
          priority
          src="/media/ui/listen-speaker.png"
          width={640}
        />
      </div>
      <div className="article-audio-content">
        <div className="article-audio-heading">
          <span className="article-audio-label">{english ? "Listen to article" : "Poslušaj članak"}</span>
          <small>{english ? "Choose a voice" : "Odaberi glas"}</small>
        </div>
        <div className="article-audio-controls">
          <div className="article-audio-voices">
            {(["vlado", "mirjana"] as const).map((profile) => {
              const active = activeProfile === profile;
              const icon = active ? (loading ? "…" : paused ? "▶" : "❚❚") : "▶";
              const action = active && !paused
                ? (english ? `Pause ${voiceNames[profile]}` : `Pauziraj glas ${voiceNames[profile]}`)
                : (english ? `Listen with ${voiceNames[profile]}` : `Poslušaj glas ${voiceNames[profile]}`);

              return (
                <button
                  type="button"
                  className={`article-audio-voice${active ? " is-active" : ""}`}
                  aria-label={action}
                  aria-pressed={active}
                  disabled={!ready}
                  key={profile}
                  onClick={() => toggleProfile(profile)}
                >
                  <span className="article-audio-voice-icon" aria-hidden="true">{icon}</span>
                  {voiceNames[profile]}
                </button>
              );
            })}
          </div>
          {activeProfile && (
            <button
              className="article-audio-stop"
              type="button"
              onClick={() => resetPlayer(english ? "Reading stopped." : "Čitanje je zaustavljeno.")}
            >
              {english ? "Stop" : "Zaustavi"}
            </button>
          )}
        </div>
        {status && <span className="article-audio-status" aria-live="polite">{status}</span>}
      </div>
    </div>
  );
}
