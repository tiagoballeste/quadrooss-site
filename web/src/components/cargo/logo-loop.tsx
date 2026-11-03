import type { CSSProperties } from "react";

type Logo = {
  file: string;
  scale: number;
};

// Every source image uses the same 1000×354 artboard, but the visible artwork
// occupies a very different area. These optical scales balance the actual marks.
export const logos: Logo[] = [
  { file: "G3158456_Prancheta-1.png", scale: 0.54 },
  { file: "H3158456_Prancheta-2.png", scale: 1.13 },
  { file: "P3158456_Prancheta-3.png", scale: 0.93 },
  { file: "E3158456_Prancheta-4.png", scale: 0.68 },
  { file: "X3158456_Prancheta-5.png", scale: 1.26 },
  { file: "K3158456_Prancheta-6.png", scale: 1.66 },
  { file: "U3158456_Prancheta-7.png", scale: 1.44 },
  { file: "Z3158456_Prancheta-8.png", scale: 1.24 },
  { file: "E3158456_Prancheta-9.png", scale: 1.93 },
  { file: "X3158456_Prancheta-10.png", scale: 0.99 },
  { file: "J3158456_Prancheta-11.png", scale: 1.34 },
  { file: "O3158456_Prancheta-12.png", scale: 1.11 },
  { file: "Z3158456_Prancheta-13.png", scale: 0.72 },
  { file: "G3158456_Prancheta-14.png", scale: 1.34 },
  { file: "V3158456_Prancheta-15.png", scale: 1.48 },
  { file: "Y3158456_Prancheta-16.png", scale: 1.22 },
  { file: "G3158456_Prancheta-17.png", scale: 2.36 },
  { file: "O3158456_Prancheta-18.png", scale: 2.53 },
  { file: "E3158456_Prancheta-19.png", scale: 2.02 },
  { file: "P3158456_Prancheta-20.png", scale: 1.52 },
  { file: "Y3158456_Prancheta-21.png", scale: 1.92 },
  { file: "S3158456_Prancheta-22.png", scale: 0.95 },
  { file: "S3158456_Prancheta-23.png", scale: 0.88 },
  { file: "J3158456_Prancheta-24.png", scale: 1.44 },
  { file: "G3158456_Prancheta-25.png", scale: 1.31 },
  { file: "F3158456_Prancheta-26.png", scale: 1.65 },
  { file: "S3158456_Prancheta-27.png", scale: 1.21 },
  { file: "U3158456_Prancheta-29.png", scale: 1.4 },
  { file: "V3158456_Prancheta-30.png", scale: 1.04 },
  { file: "F3158456_Prancheta-31.png", scale: 2.19 },
  { file: "T3158456_Prancheta-32.png", scale: 2.72 },
  { file: "W3158456_Prancheta-33.png", scale: 1.52 },
  { file: "M3158456_Prancheta-34.png", scale: 2.01 },
  { file: "A3158456_Prancheta-35.png", scale: 1.91 },
  { file: "W3158456_Prancheta-36.png", scale: 1.68 },
  { file: "V3158456_Prancheta-37.png", scale: 1.46 },
  { file: "B3158456_Prancheta-38.png", scale: 2.5 },
  { file: "G3158456_Prancheta-39.png", scale: 1.02 },
  { file: "P3158456_Prancheta-40.png", scale: 0.85 },
  { file: "X3158456_Prancheta-41.png", scale: 1.25 },
  { file: "Y3158456_Prancheta-42.png", scale: 0.88 },
  { file: "M3158456_Prancheta-44.png", scale: 2.71 },
  { file: "E3158456_Prancheta-45.png", scale: 1.12 },
];

export function LogoLoop() {
  return (
    <div className="ll-wrap">
      <div className="ll-track">
        {[...logos, ...logos].map((logo, index) => (
          <div className="ll-item" key={`${logo.file}-${index}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/full/${encodeURIComponent(logo.file)}.webp`}
              alt=""
              loading="lazy"
              style={{ "--logo-scale": logo.scale } as CSSProperties}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
