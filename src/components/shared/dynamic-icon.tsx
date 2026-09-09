import * as Icons from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';

type DynamicIconProps = LucideProps & {
  name: string;
};

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // ১. Lucide icons অবজেক্ট থেকে নাম অনুযায়ী আইকন খুঁজে বের করা
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[name];

  // ২. যদি নাম ভুল থাকে বা আইকন না পাওয়া যায়, তবে একটি ডিফোল্ট fallback আইকন রেন্ডার হবে
  if (!IconComponent) {
    const FallbackIcon = Icons.HelpCircle;
    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
}