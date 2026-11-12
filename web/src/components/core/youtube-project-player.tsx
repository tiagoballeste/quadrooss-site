"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
 * YouTube counterpart of VimeoProjectPlayer: same markup and class names, so the
 * Journal dialog gets the exact controls of the Work dialog. Built on YouTube's
 * IFrame Player API, loaded once on first use. YouTube does not let a page pick
 * the video quality, so the quality menu is left out.
 */

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2] as const;
const PLAYING = 1;

let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("YouTube API failed to load"));
    };
    document.head.append(script);
  });
  return apiPromise;
}

function formatPlaybackRate(rate: number) {
  return `${rate.toString().replace(".", ",")}x`;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return hours ? `${hours}:${minutes.toString().padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg aria-hidden="true" className="work-project-player-controls__icon" fill="none" viewBox="0 0 24 24">
      <path d="M4 9.5h4l5-4v13l-5-4H4z" fill="currentColor" />
      {muted ? (
        <>
          <path d="m16 9 5 5" stroke="currentColor" strokeLinecap="round" />
          <path d="m21 9-5 5" stroke="currentColor" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M16 9a4 4 0 0 1 0 6" stroke="currentColor" strokeLinecap="round" />
          <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function YouTubeProjectPlayer({ title, videoId }: { title: string; videoId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const lastAudibleVolumeRef = useRef(1);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);

  useEffect(() => {
    if (!speedOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !settingsRef.current?.contains(event.target)) setSpeedOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [speedOpen]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let active = true;
    let poll = 0;
    const target = document.createElement("div");
    host.append(target);

    loadYouTubeApi()
      .then((YT) => {
        if (!active) return;
        const player = new YT.Player(target, {
          videoId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: ({ target: readyPlayer }) => {
              if (!active) return;
              playerRef.current = readyPlayer;
              const iframe = readyPlayer.getIframe();
              iframe.setAttribute("title", `Vídeo: ${title}`);
              iframe.setAttribute("tabindex", "-1");
              readyPlayer.mute();
              readyPlayer.playVideo();
              setDuration(readyPlayer.getDuration());
              setReady(true);
              poll = window.setInterval(() => {
                const current = playerRef.current;
                if (!current) return;
                setCurrentTime(current.getCurrentTime());
                setDuration(current.getDuration());
                setIsMuted(current.isMuted());
              }, 250);
            },
            onStateChange: ({ data }) => setIsPlaying(data === PLAYING),
          },
        });
        playerRef.current = player;
      })
      .catch(() => undefined);

    return () => {
      active = false;
      window.clearInterval(poll);
      try {
        playerRef.current?.destroy();
      } catch {}
      playerRef.current = null;
      host.replaceChildren();
    };
  }, [title, videoId]);

  const player = () => (ready ? playerRef.current : null);

  const togglePlayback = () => {
    const current = player();
    if (!current) return;
    if (isPlaying) current.pauseVideo();
    else current.playVideo();
  };

  const toggleMuted = () => {
    const current = player();
    if (!current) return;
    if (!isMuted) {
      current.mute();
      setIsMuted(true);
      return;
    }
    const restored = volume > 0 ? volume : lastAudibleVolumeRef.current;
    setVolume(restored);
    current.setVolume(Math.round(restored * 100));
    current.unMute();
    setIsMuted(false);
  };

  const changeVolume = (next: number) => {
    const current = player();
    if (!current) return;
    setVolume(next);
    setIsMuted(next === 0);
    if (next > 0) lastAudibleVolumeRef.current = next;
    current.setVolume(Math.round(next * 100));
    if (next === 0) current.mute();
    else current.unMute();
  };

  const seek = (value: number) => {
    setCurrentTime(value);
    player()?.seekTo(value, true);
  };

  const enterFullscreen = () => {
    void player()?.getIframe().requestFullscreen?.().catch(() => undefined);
  };

  const selectPlaybackRate = (rate: number) => {
    const current = player();
    if (!current) return;
    setSpeedOpen(false);
    current.setPlaybackRate(rate);
    setPlaybackRate(rate);
  };

  return (
    <>
      <motion.div
        animate={{ opacity: ready ? 1 : 0 }}
        aria-hidden="true"
        className="work-project-dialog__player youtube-project-player"
        initial={{ opacity: 0 }}
        ref={hostRef}
        transition={{ delay: 0.18, duration: 0.38, ease: "easeOut" }}
      />
      <div className="work-project-player-controls" aria-label="Controles do vídeo">
        <button aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"} onClick={togglePlayback} type="button">
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
        </button>
        <span className="work-project-player-controls__time is-current">{formatTime(currentTime)}</span>
        <input
          aria-label="Progresso do vídeo"
          className="work-project-player-controls__progress"
          max={Math.max(duration, 0.01)}
          min="0"
          onChange={(event) => seek(Number(event.currentTarget.value))}
          step="0.1"
          type="range"
          value={Math.min(currentTime, Math.max(duration, 0.01))}
        />
        <span className="work-project-player-controls__time is-duration">{formatTime(duration)}</span>
        <div className="work-project-player-volume">
          <button aria-label={isMuted ? "Ativar som" : "Desativar som"} onClick={toggleMuted} type="button">
            <SpeakerIcon muted={isMuted || volume === 0} />
          </button>
          <input
            aria-label="Volume do vídeo"
            aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)}%`}
            className="work-project-player-volume__slider"
            max="1"
            min="0"
            onChange={(event) => changeVolume(Number(event.currentTarget.value))}
            step="0.01"
            type="range"
            value={isMuted ? 0 : volume}
          />
        </div>
        <div
          className="work-project-player-settings"
          onKeyDown={(event) => {
            if (event.key !== "Escape" || !speedOpen) return;
            event.preventDefault();
            event.stopPropagation();
            setSpeedOpen(false);
          }}
          ref={settingsRef}
        >
          <div className="work-project-player-setting">
            <button
              aria-expanded={speedOpen}
              aria-haspopup="menu"
              aria-label={`Velocidade de reprodução: ${formatPlaybackRate(playbackRate)}`}
              className="work-project-player-setting__trigger"
              onClick={() => setSpeedOpen((open) => !open)}
              type="button"
            >
              {formatPlaybackRate(playbackRate)}
            </button>
            <AnimatePresence>
              {speedOpen ? (
                <motion.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  aria-label="Selecionar velocidade de reprodução"
                  className="work-project-player-setting__menu"
                  exit={{ opacity: 0, scale: 0.96, y: 4 }}
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  role="menu"
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="work-project-player-setting__label">Velocidade</span>
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      aria-checked={rate === playbackRate}
                      className={rate === playbackRate ? "is-active" : undefined}
                      key={rate}
                      onClick={() => selectPlaybackRate(rate)}
                      role="menuitemradio"
                      type="button"
                    >
                      <span aria-hidden="true" className="work-project-player-setting__check">
                        {rate === playbackRate ? "✓" : ""}
                      </span>
                      {formatPlaybackRate(rate)}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
        <button aria-label="Abrir vídeo em tela cheia" onClick={enterFullscreen} type="button">
          <span aria-hidden="true">⛶</span>
        </button>
      </div>
    </>
  );
}
