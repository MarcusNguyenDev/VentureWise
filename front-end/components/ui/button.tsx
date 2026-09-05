"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
  size?: ButtonSize;
}

const TONE_CLASSES: Record<ButtonTone, string> = {
  primary:
    "bg-accent text-accent-ink hover:opacity-90 border border-transparent",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-sunken",
  ghost: "bg-transparent text-ink-muted border border-transparent hover:text-ink",
  danger: "bg-poor text-canvas border border-transparent hover:opacity-90",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  small: "h-8 px-3 text-xs",
  medium: "h-10 px-4 text-sm",
  large: "h-12 px-6 text-base",
};

export function Button({
  tone = "primary",
  size = "medium",
  className,
  ...button_props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-40",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className,
      )}
      {...button_props}
    />
  );
}
