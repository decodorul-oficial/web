import React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  onValueCommit?: (value: number) => void;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onValueCommit,
  className,
  ...props
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleCommit = () => {
    if (onValueCommit) {
      onValueCommit(value);
    }
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      onMouseUp={handleCommit}
      onTouchEnd={handleCommit}
      className={cn(
        'legislative-slider w-full h-2 cursor-pointer appearance-none rounded-full bg-gray-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-info/50',
        className
      )}
      {...props}
    />
  );
}
