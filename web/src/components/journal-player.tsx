"use client";

import { useState } from "react";
import { useUi } from "@/components/use-locale";

type JournalPlayerProps = {
  videoId: string;
  title: string;
  duration: string;
  poster: { src: string; srcSet: string | null };
  caption: string;
  youtube: string;
};

/**
 * Shows the cover with a play button and only loads YouTube's player when the
 * visitor asks for it, so the page stays light until then.
 */
export function JournalPlayer({ videoId, title, duration, poster, caption, youtube }: JournalPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const ui = useUi();

  return (
    <figure className="journal-player">
      <div className="journal-player__frame">
        {playing ? (
          <iframe
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
            title={title}
          />
        ) : (
          <button className="journal-player__poster" onClick={() => setPlaying(true)} type="button">
            <img alt="" decoding="async" sizes="100vw" src={poster.src} srcSet={poster.srcSet ?? undefined} />
            <span className="journal-player__play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
              </svg>
            </span>
            <span className="journal-player__label">{ui.journal.watch} · {duration}</span>
            <span className="sr-only">{ui.journal.watch} {title}</span>
          </button>
        )}
      </div>
      <figcaption className="journal-player__caption">
        <span>{caption}</span>
        <a href={youtube} rel="noreferrer" target="_blank">
          YouTube ↗
        </a>
      </figcaption>
    </figure>
  );
}
