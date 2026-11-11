/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

type PublicMediaFrameProps = {
  alt: string;
  aspectRatio?: string;
  className?: string;
  fallbackLabel: string;
  height?: number;
  kind?: "image" | "video";
  loading?: "eager" | "lazy";
  mobileSrc?: string;
  poster?: string;
  src?: string;
  width?: number;
};

export function PublicMediaFrame({
  alt,
  aspectRatio = "16 / 9",
  className,
  fallbackLabel,
  height,
  kind = "image",
  loading,
  mobileSrc,
  poster,
  src,
  width,
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

  if (!mobileSrc) {
    // Public URLs are intentionally not passed to Next image optimization until their hosts are approved.
    return <img alt={alt} className={classes} height={height} loading={loading} src={src} style={style} width={width} />;
  }

  return (
    <picture className={classes} style={style}>
      <source media="(max-width: 39.99rem)" srcSet={mobileSrc} type="image/webp" />
      <img alt={alt} height={height} loading={loading} src={src} width={width} />
    </picture>
  );
}
