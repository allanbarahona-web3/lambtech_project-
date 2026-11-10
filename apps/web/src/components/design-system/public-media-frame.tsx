import type { CSSProperties } from "react";

type PublicMediaFrameProps = {
  alt: string;
  aspectRatio?: string;
  className?: string;
  fallbackLabel: string;
  kind?: "image" | "video";
  poster?: string;
  src?: string;
};

export function PublicMediaFrame({
  alt,
  aspectRatio = "16 / 9",
  className,
  fallbackLabel,
  kind = "image",
  poster,
  src,
}: PublicMediaFrameProps) {
  const style = { "--media-aspect-ratio": aspectRatio } as CSSProperties;
  const classes = ["public-media-frame", className].filter(Boolean).join(" ");

  if (!src) {
    return (
      <div aria-label={fallbackLabel} className={`${classes} public-media-frame--placeholder`} role="img" style={style}>
        <span aria-hidden="true" className="public-media-frame__placeholder-mark" />
        <span className="sr-only">{fallbackLabel}</span>
      </div>
    );
  }

  if (kind === "video") {
    return <video aria-label={alt} className={classes} controls playsInline poster={poster} preload="metadata" style={style} src={src} />;
  }

  // Public URLs are intentionally not passed to Next image optimization until their hosts are approved.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} className={classes} src={src} style={style} />;
}
