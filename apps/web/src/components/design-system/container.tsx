import type { ReactNode } from "react";

type ContainerWidth = "content" | "prose";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  width?: ContainerWidth;
};

export function Container({
  children,
  className,
  width = "content",
}: ContainerProps) {
  const classes = ["container", `container--${width}`, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
