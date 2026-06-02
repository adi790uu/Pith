import type { CSSProperties } from "react";

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({
  width,
  height = 14,
  radius,
  className = "",
  style
}: SkeletonProps) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style
      }}
    />
  );
}
