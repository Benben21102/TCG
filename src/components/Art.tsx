import React from "react";

type ArtProps = { name: string; imageMap: Record<string, string> };

export function Art({ name, imageMap }: ArtProps) {
  const src = imageMap?.[name];
  return (
    <div
      className={`art ${src ? "has" : "none"}`}
      style={src ? { backgroundImage: `url(${src})` } : undefined}
    />
  );
}
