"use client";

import Image from "next/image";
import { type ChangeEvent, type CSSProperties, useEffect, useRef, useState } from "react";

type VoiceProfile = "vlado";

type PlayerProps = {
  locale?: "hr" | "en";
  partCount: number;
  ready: boolean;
  slug: string;
  title: string;
  version: string;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ArticleAudioPlayer({ locale = "hr", partCount, ready, slug, title, version }: PlayerProps) {
  const english = locale === "en";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef(0);
  const [activeProfile, setActiveProfile] = useState<VoiceProfile | null>(null);
  const [currentPart, setCurrentPart] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState(ready ? "" : (english ? "The ElevenLabs narrator is being configured." : "ElevenLabs narator još se konfigurira."));

  function disposeAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.oncanplay = null;
    audio.onended = null;
    audio.onerror = null;
    audio.ondurationchange = null;
    audio.onloadedmetadata = null;
    audio.onplaying = null;
    audio.ontimeupdate = null;
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
    setCurrentPart(0);
    setCurrentTime(0);
    setDuration(0);
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
    setCurrentPart(part);
    setCurrentTime(0);
    setDuration(0);
    setLoading(true);
    setPaused(false);
    setStatus(english
      ? `The narrator is preparing the article${partCount > 1 ? ` · part ${part + 1}/${partCount}` : ""}.`
      : `Narator priprema članak${partCount > 1 ? ` · dio ${part + 1}/${partCount}` : ""}.`);

    audio.onplaying = () => {
      if (sessionRef.current !== session) return;
      setLoading(false);
      setPaused(false);
      setStatus(english
        ? `The narrator is reading${partCount > 1 ? ` · part ${part + 1}/${partCount}` : ""}.`
        : `Narator čita članak${partCount > 1 ? ` · dio ${part + 1}/${partCount}` : ""}.`);
    };
    audio.onwaiting = () => {
      if (sessionRef.current === session) setLoading(true);
    };
    const updateDuration = () => {
      if (sessionRef.current !== session) return;
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.onloadedmetadata = updateDuration;
    audio.ondurationchange = updateDuration;
    audio.ontimeupdate = () => {
      if (sessionRef.current === session) setCurrentTime(audio.currentTime);
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
      setStatus(english ? "The ElevenLabs narrator is being configured." : "ElevenLabs narator još se konfigurira.");
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

  function seekAudio(event: ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(duration) || duration <= 0) return;
    const nextTime = Math.min(Math.max(Number(event.target.value), 0), duration);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  const timelineProgress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const timelineStyle = { "--audio-progress": `${timelineProgress}%` } as CSSProperties;
  const timelineValue = duration > 0 ? Math.min(currentTime, duration) : 0;
  const active = activeProfile === "vlado";
  const playbackIcon = active ? (loading ? "…" : paused ? "▶" : "❚❚") : "▶";
  const playbackLabel = active
    ? loading
      ? (english ? "Preparing audio" : "Priprema audija")
      : paused
        ? (english ? "Continue listening" : "Nastavi slušanje")
        : (english ? "Pause" : "Pauziraj")
    : (english ? "Play article" : "Pokreni slušanje");
  const playbackAction = active
    ? loading
      ? (english ? "Stop preparing audio" : "Zaustavi pripremu audija")
      : paused
        ? (english ? "Continue listening" : "Nastavi slušanje")
        : (english ? "Pause male narrator" : "Pauziraj muškog naratora")
    : (english ? "Listen to article with male narrator" : "Poslušaj članak s muškim naratorom");

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
          <small>{english ? "Male narrator" : "Muški narator"}</small>
        </div>
        <div className="article-audio-controls">
          <button
            type="button"
            className={`article-audio-play${active ? " is-active" : ""}`}
            aria-label={playbackAction}
            aria-pressed={active}
            disabled={!ready}
            onClick={() => toggleProfile("vlado")}
          >
            <span className="article-audio-play-icon" aria-hidden="true">{playbackIcon}</span>
            <span>{playbackLabel}</span>
          </button>
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
        <div className="article-audio-timeline">
          <span className="article-audio-time">{formatTime(timelineValue)}</span>
          <input
            aria-label={english ? "Seek through article audio" : "Premotaj audio članka"}
            aria-valuetext={`${formatTime(timelineValue)} / ${duration > 0 ? formatTime(duration) : "--:--"}${partCount > 1 ? ` · ${english ? "part" : "dio"} ${currentPart + 1}/${partCount}` : ""}`}
            className="article-audio-range"
            disabled={!activeProfile || duration <= 0}
            max={Math.max(duration, 1)}
            min="0"
            onChange={seekAudio}
            step="0.1"
            style={timelineStyle}
            type="range"
            value={timelineValue}
          />
          <span className="article-audio-time article-audio-time--end">
            {duration > 0 ? formatTime(duration) : "--:--"}
          </span>
        </div>
        {status && <span className="article-audio-status" aria-live="polite">{status}</span>}
      </div>
    </div>
  );
}
