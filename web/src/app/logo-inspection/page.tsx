import type { Metadata } from "next";
import { logos } from "@/components/logo-loop";

// Internal tool for checking logo balance. Kept reachable but out of search results.
export const metadata: Metadata = {
  title: "Logo inspection",
  robots: { index: false, follow: false },
};

export default function LogoInspectionPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#0b0b0a",
        color: "white",
        fontFamily: '"Helvetica Neue", "HelveticaNeue"',
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {logos.map((logo) => (
          <figure
            key={logo.file}
            style={{
              display: "grid",
              gridTemplateRows: "120px auto",
              placeItems: "center",
              margin: 0,
              padding: 10,
              border: "1px solid #333",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/full/${encodeURIComponent(logo.file)}.webp`}
              alt=""
              style={{
                display: "block",
                width: "100%",
                height: 100,
                objectFit: "contain",
                transform: `scale(${logo.scale})`,
              }}
            />
            <figcaption style={{ opacity: 0.75 }}>
              {logo.file.match(/-(\d+)\.png$/)?.[1]}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
