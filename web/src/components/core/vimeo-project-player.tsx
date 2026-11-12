"use client";

import { useUi } from "@/components/use-locale";
import Player, {
  type PlaybackRateChangeEvent,
  type QualityChangeEvent,
  type VolumeChangeEvent,
  type VimeoEvent,
  type VimeoQuality,
} from "@vimeo/player";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const PLAYBACK_RATES = [0.5, 1, 1.25, 1.5, 2] as const;

function formatPlaybackRate(rate: number) {
  return `${rate.toString().replace(".", ",")}x`;
}

function getQualityRank(quality: VimeoQuality) {
  if (quality.id === "auto") return Number.POSITIVE_INFINITY;
  if (quality.id.toLowerCase().includes("4k")) return 4000;
  if (quality.id.toLowerCase().includes("2k")) return 2000;
  return Number.parseInt(quality.id, 10) || 0;
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="work-project-player-controls__icon"
      fill="none"
      viewBox="0 0 24 24"
    >
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

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="work-project-player-controls__icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.74v.5a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function VimeoProjectPlayer({
  title,
  vimeoId,
}: {
  title: string;
  vimeoId: string;
}) {
  const ui = useUi();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const lastAudibleVolumeRef = useRef(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeQuality, setActiveQuality] = useState("auto");
  const [qualities, setQualities] = useState<VimeoQuality[]>([
    { active: true, id: "auto", label: "Auto" },
  ]);
  const [openMenu, setOpenMenu] = useState<"quality" | "speed" | null>(null);

  const orderedQualities = useMemo(
    () => [...qualities].sort((a, b) => getQualityRank(b) - getQualityRank(a)),
    [qualities],
  );
  const activeQualityLabel =
    qualities.find((quality) => quality.id === activeQuality)?.label ??
    (activeQuality === "auto" ? "Auto" : activeQuality?.toUpperCase() || "Auto");

  useEffect(() => {
    if (!openMenu) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !settingsRef.current?.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [openMenu]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let active = true;
    const player = new Player(iframe);
    playerRef.current = player;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = (event: VimeoEvent) => {
      setCurrentTime(event.seconds);
      setDuration(event.duration);
    };
    const handleVolumeChange = ({
      muted,
      volume: nextVolume,
    }: VolumeChangeEvent) => {
      setIsMuted(muted);
      setVolume(nextVolume);
      if (!muted && nextVolume > 0) {
        lastAudibleVolumeRef.current = nextVolume;
      }
    };
    const handlePlaybackRateChange = ({
      playbackRate: nextPlaybackRate,
    }: PlaybackRateChangeEvent) => setPlaybackRate(nextPlaybackRate);
    const handleQualityChange = ({ quality }: QualityChangeEvent) => {
      if (!quality) return;
      setActiveQuality(quality);
      setQualities((current) =>
        current.map((item) => ({ ...item, active: item.id === quality })),
      );
    };

    player.on("play", handlePlay);
    player.on("pause", handlePause);
    player.on("ended", handlePause);
    player.on("timeupdate", handleTimeUpdate);
    player.on("volumechange", handleVolumeChange);
    player.on("playbackratechange", handlePlaybackRateChange);
    player.on("qualitychange", handleQualityChange);

    void player
      .ready()
      .then(async () => {
        await player.setMuted(true).catch(() => undefined);
        await player.play().catch(() => undefined);
        const [
          paused,
          muted,
          currentVolume,
          videoDuration,
          currentPlaybackRate,
          availableQualities,
          currentQuality,
        ] = await Promise.all([
          player.getPaused(),
          player.getMuted(),
          player.getVolume().catch(() => 1),
          player.getDuration(),
          player.getPlaybackRate().catch(() => 1),
          player.getQualities().catch(() => [] as VimeoQuality[]),
          player.getQuality().catch(() => "auto"),
        ]);
        if (!active) return;
        setIsPlaying(!paused);
        setIsMuted(muted);
        setVolume(currentVolume);
        if (!muted && currentVolume > 0) {
          lastAudibleVolumeRef.current = currentVolume;
        }
        setDuration(videoDuration);
        setPlaybackRate(currentPlaybackRate);
        const normalizedCurrentQuality = currentQuality || "auto";
        setActiveQuality(normalizedCurrentQuality);
        setQualities(() => {
          const nextQualities = availableQualities.some(
            (quality) => quality.id === "auto",
          )
            ? availableQualities
            : [
                {
                  active: normalizedCurrentQuality === "auto",
                  id: "auto",
                  label: "Auto",
                },
                ...availableQualities,
              ];

          return nextQualities.map((quality) => ({
            ...quality,
            active: quality.id === normalizedCurrentQuality,
          }));
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
      player.off("play", handlePlay);
      player.off("pause", handlePause);
      player.off("ended", handlePause);
      player.off("timeupdate", handleTimeUpdate);
      player.off("volumechange", handleVolumeChange);
      player.off("playbackratechange", handlePlaybackRateChange);
      player.off("qualitychange", handleQualityChange);
      void player.pause().catch(() => undefined);
      playerRef.current = null;
    };
  }, [vimeoId]);

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    void (isPlaying ? player.pause() : player.play()).catch(() => undefined);
  };

  const toggleMuted = () => {
    const player = playerRef.current;
    if (!player) return;

    if (!isMuted) {
      void player.setMuted(true).catch(() => undefined);
      return;
    }

    const restoredVolume = volume > 0 ? volume : lastAudibleVolumeRef.current;
    setVolume(restoredVolume);
    void player
      .setVolume(restoredVolume)
      .then(() => player.setMuted(false))
      .catch(() => undefined);
  };

  const changeVolume = (nextVolume: number) => {
    const player = playerRef.current;
    if (!player) return;

    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    if (nextVolume > 0) lastAudibleVolumeRef.current = nextVolume;

    void player
      .setVolume(nextVolume)
      .then(() => player.setMuted(nextVolume === 0))
      .catch(() => undefined);
  };

  const seek = (value: number) => {
    setCurrentTime(value);
    void playerRef.current?.setCurrentTime(value).catch(() => undefined);
  };

  const enterFullscreen = () => {
    void playerRef.current?.requestFullscreen().catch(() => undefined);
  };

  const selectPlaybackRate = (nextPlaybackRate: number) => {
    const player = playerRef.current;
    if (!player) return;

    setOpenMenu(null);
    void player
      .setPlaybackRate(nextPlaybackRate)
      .then(setPlaybackRate)
      .catch(() => undefined);
  };

  const selectQuality = (qualityId: string) => {
    const player = playerRef.current;
    if (!player) return;

    setOpenMenu(null);
    setActiveQuality(qualityId);
    setQualities((current) =>
      current.map((quality) => ({
        ...quality,
        active: quality.id === qualityId,
      })),
    );
    void player.setQuality(qualityId).catch(() => undefined);
  };

  return (
    <>
      <motion.iframe
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        allowFullScreen
        animate={{ opacity: 1 }}
        aria-hidden="true"
        className="work-project-dialog__player"
        initial={{ opacity: 0 }}
        loading="eager"
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&controls=0&title=0&byline=0&portrait=0&dnt=1`}
        tabIndex={-1}
        title={ui.player.videoOf(title)}
        transition={{ delay: 0.18, duration: 0.38, ease: "easeOut" }}
      />

      <div className="work-project-player-controls" aria-label={ui.player.controls}>
        <button
          aria-label={isPlaying ? ui.player.pause : ui.player.play}
          onClick={togglePlayback}
          type="button"
        >
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
        </button>

        <span className="work-project-player-controls__time is-current">
          {formatTime(currentTime)}
        </span>
        <input
          aria-label={ui.player.progress}
          className="work-project-player-controls__progress"
          max={Math.max(duration, 0.01)}
          min="0"
          onChange={(event) => seek(Number(event.currentTarget.value))}
          step="0.1"
          type="range"
          value={Math.min(currentTime, Math.max(duration, 0.01))}
        />
        <span className="work-project-player-controls__time is-duration">
          {formatTime(duration)}
        </span>

        <div className="work-project-player-volume">
          <button
            aria-label={isMuted ? ui.player.unmute : ui.player.mute}
            onClick={toggleMuted}
            type="button"
          >
            <SpeakerIcon muted={isMuted || volume === 0} />
          </button>
          <input
            aria-label={ui.player.volume}
            aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)}%`}
            className="work-project-player-volume__slider"
            max="1"
            min="0"
            onChange={(event) =>
              changeVolume(Number(event.currentTarget.value))
            }
            step="0.01"
            type="range"
            value={isMuted ? 0 : volume}
          />
        </div>

        <div
          className="work-project-player-settings"
          onKeyDown={(event) => {
            if (event.key !== "Escape" || !openMenu) return;
            event.preventDefault();
            event.stopPropagation();
            setOpenMenu(null);
          }}
          ref={settingsRef}
        >
          <div className="work-project-player-setting">
            <button
              aria-expanded={openMenu === "quality"}
              aria-haspopup="menu"
              aria-label={ui.player.quality(activeQualityLabel)}
              className="work-project-player-setting__trigger is-quality"
              onClick={() =>
                setOpenMenu((current) =>
                  current === "quality" ? null : "quality",
                )
              }
              type="button"
            >
              <SettingsIcon />
            </button>
            <AnimatePresence>
              {openMenu === "quality" ? (
                <motion.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  aria-label={ui.player.selectQuality}
                  className="work-project-player-setting__menu"
                  exit={{ opacity: 0, scale: 0.96, y: 4 }}
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  role="menu"
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="work-project-player-setting__label">
                    Qualidade
                  </span>
                  {orderedQualities.map((quality) => (
                    <button
                      aria-checked={quality.id === activeQuality}
                      className={
                        quality.id === activeQuality ? "is-active" : undefined
                      }
                      key={quality.id}
                      onClick={() => selectQuality(quality.id)}
                      role="menuitemradio"
                      type="button"
                    >
                      <span aria-hidden="true" className="work-project-player-setting__check">
                        {quality.id === activeQuality ? "✓" : ""}
                      </span>
                      {quality.label}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="work-project-player-setting">
            <button
              aria-expanded={openMenu === "speed"}
              aria-haspopup="menu"
              aria-label={ui.player.speed(formatPlaybackRate(playbackRate))}
              className="work-project-player-setting__trigger"
              onClick={() =>
                setOpenMenu((current) =>
                  current === "speed" ? null : "speed",
                )
              }
              type="button"
            >
              {formatPlaybackRate(playbackRate)}
            </button>
            <AnimatePresence>
              {openMenu === "speed" ? (
                <motion.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  aria-label={ui.player.selectSpeed}
                  className="work-project-player-setting__menu"
                  exit={{ opacity: 0, scale: 0.96, y: 4 }}
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  role="menu"
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="work-project-player-setting__label">
                    Velocidade
                  </span>
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

        <button
          aria-label={ui.player.fullscreen}
          onClick={enterFullscreen}
          type="button"
        >
          <span aria-hidden="true">⛶</span>
        </button>
      </div>
    </>
  );
}
