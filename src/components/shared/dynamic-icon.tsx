import * as Icons from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';

type DynamicIconProps = LucideProps & {
  name: string;
};

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent =
    (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.HelpCircle;

  return <IconComponent {...props} />;
}