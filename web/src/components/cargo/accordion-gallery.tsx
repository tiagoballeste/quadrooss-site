"use client";

import { useState } from "react";

const works = [
  ["KYAN CENA 2K25", "https://vimeo.com/1142204764", "https://i.vimeocdn.com/video/2089877907-4d084b63c280a4ed62f4d57897e8349de4685770caef78361a27e2d488dfdabd-d_960?region=us"],
  ["ABRA SUA CABECA — RESPEITA OS MOTOCAS", "https://vimeo.com/1109124991", "https://i.vimeocdn.com/video/2046562912-57c82dc2f35e5bf899155b0565ca5e391b81124b3dcfe704d66d223c3e7a6b38-d_960?region=us"],
  ["NOWDAYS 4/20", "https://vimeo.com/1109152946", "https://i.vimeocdn.com/video/2046597546-8ff41ec293287c7b97988207e096961d85b9a191c8b0997eb503bed3e343c1ed-d_960?region=us"],
  ["UMBRO URBAN GLOW", "https://vimeo.com/1109146977", "https://i.vimeocdn.com/video/2048987454-f55d8ca260d671cddee749b568c06d832d28ed3ccf165de2fbe78c2ecf2651e2-d_960?region=us"],
  ["BASSAN FESTIVAL SUBMUNDO", "https://vimeo.com/1138942328", "https://i.vimeocdn.com/video/2085430675-a1baeb767a684ba9faad31548ec7a419d597a91b292a47919e94067fbef85939-d_960?region=us"],
  ["CHAMPION — WHAT MOVES YOU?", "https://vimeo.com/1117107275", "https://i.vimeocdn.com/video/2056940252-a971851b7d5f428319df70ca300829a3d5da3fcbc00f54a31e78da3f05af917d-d_960?region=us"],
  ["AFTER RUN CLUB — VINTAGE", "https://vimeo.com/1109131583", "https://i.vimeocdn.com/video/2046571140-1c201f94cba79c4e0d4ea10cd116d9f914eda4fda6d87181ad746e6a52c4e9f6-d_960?region=us"],
  ["AFTERMOVIE ADULTO IDEAL", "https://vimeo.com/1142199635", "https://i.vimeocdn.com/video/2089869824-c91ac3fdb0e7f8bb5d2a75461d6225975a421d3055ca727683040b90150845c7-d_960?region=us"],
  ["GHARD — ALPINISTA", "https://vimeo.com/1109127106", "https://i.vimeocdn.com/video/2046567472-1d162c88e95cda38c31f4c91e7f03d95e99c5405308fccc6eb449e2d07cc3298-d_960?region=us"],
] as const;

export function AccordionGallery() {
  const [active, setActive] = useState(0);

  return (
    <section className="ag-section">
      <span className="caption ag-caption">TRABALHOS</span>
      <div className="ag-gallery">
        {works.map(([title, href, image], index) => (
          <a
            className={`ag-panel${active === index ? " is-active" : ""}`}
            href={href}
            key={href}
            target="_blank"
            rel="noreferrer"
            aria-label={title}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={title} loading="lazy" />
            <span className="ag-panel-overlay" />
            <span className="ag-panel-label">
              <span className="ag-panel-bar" />
              <span className="ag-panel-text">{title}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
