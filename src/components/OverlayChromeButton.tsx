import type { ComponentProps } from 'react';
import { cn } from './ui/utils';
import { brandOverlayChromeButtonClass } from '../lib/brandClasses';

type OverlayChromeButtonSize = 'sm' | 'md' | 'lg';

const sizeClass: Record<OverlayChromeButtonSize, string> = {
  sm: 'h-10 w-10',
  md: 'min-h-[44px] min-w-[44px]',
  lg: 'h-12 w-12',
};

interface OverlayChromeButtonProps extends ComponentProps<'button'> {
  size?: OverlayChromeButtonSize;
}

/** Close / prev / next controls on lightbox and viz overlays. */
export function OverlayChromeButton({
  size = 'md',
  className,
  type = 'button',
  ...props
}: OverlayChromeButtonProps) {
  return (
    <button
      type={type}
      className={cn(brandOverlayChromeButtonClass, sizeClass[size], className)}
      {...props}
    />
  );
}
