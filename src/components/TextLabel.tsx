import { cn } from './ui/utils';
import { label } from '../lib/typography';

interface TextLabelProps {
  children: React.ReactNode;
  as?: 'p' | 'span';
  className?: string;
}

/** Uppercase micro-label — eyebrows, viz numbers, ticket date stubs. */
export function TextLabel({ children, as: Tag = 'p', className }: TextLabelProps) {
  return <Tag className={cn(label, className)}>{children}</Tag>;
}
