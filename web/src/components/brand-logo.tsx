import Image from "next/image";

export function BrandLogo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`brand-logo ${className}`.trim()}>
      <Image
        alt="Quadrooss"
        height={234}
        priority={priority}
        src="/images/quadrooss-wordmark.png"
        width={1838}
      />
    </span>
  );
}
