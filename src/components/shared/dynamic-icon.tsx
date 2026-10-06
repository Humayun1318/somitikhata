import {
  ArrowUpRight,
  BarChart3,
  BookOpenText,
  CalendarCheck,
  ChevronDown,
  CircleHelp,
  FilePlus,
  FileSpreadsheet,
  FileText,
  FolderTree,
  HandCoins,
  History,
  IdCard,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  PiggyBank,
  Receipt,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

// The icons the navigation config refers to by name. A fixed list (not
// `import * as Icons`), so only these end up in the browser bundle instead of
// the whole icon set. A new sidebar icon is added here.
const ICONS: Record<string, LucideIcon> = {
  ArrowUpRight,
  BarChart3,
  BookOpenText,
  CalendarCheck,
  ChevronDown,
  FilePlus,
  FileSpreadsheet,
  FileText,
  FolderTree,
  HandCoins,
  History,
  IdCard,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  PiggyBank,
  Receipt,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
};

type DynamicIconProps = LucideProps & { name: string };

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = ICONS[name] ?? CircleHelp;
  return <IconComponent {...props} />;
}
