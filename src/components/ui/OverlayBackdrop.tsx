"use client";

import React from 'react';

type OverlayBackdropProps = {
  position?: 'fixed' | 'absolute';
  className?: string;
  zIndexClass?: string; // e.g., z-[60]
  onClick?: () => void;
  ariaHidden?: boolean;
};

export function OverlayBackdrop({
  position = 'fixed',
  className,
  zIndexClass,
  onClick,
  ariaHidden = true,
}: OverlayBackdropProps) {
  return (
    <div
      className={`${position} inset-0 ${zIndexClass || ''} bg-white/50 backdrop-blur-sm transition-all duration-200 ${className || ''}`}
      onClick={onClick}
      aria-hidden={ariaHidden}
    />
  );
}

export default OverlayBackdrop;


