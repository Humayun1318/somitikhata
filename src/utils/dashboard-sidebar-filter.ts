import { DashboardSidebarItem, Permission, UserRole } from '@/types/dashboard-sidbar';


type FilterParams = {
  items: DashboardSidebarItem[];
  userRole: UserRole;
  userPermissions?: Permission[];
};

export function filterSidebarItemsByRole({
  items,
  userRole,
  userPermissions = [],
}: FilterParams): DashboardSidebarItem[] {
  return items.reduce<DashboardSidebarItem[]>((acc, item) => {
    // ১. চেক করুন ইউজার রোল এই মেনুর সাথে মিলে কিনা
    const hasRole = item.roles.includes(userRole);

    // ২. পারমিশন ফিল্টারিং (যদি থাকে)
    const hasPermission =
      !item.permissions ||
      item.permissions.some((p) => userPermissions.includes(p));

    if (!hasRole || !hasPermission) {
      return acc;
    }

    // ৩. সাব-মেনু ফিল্টারিং (যদি চিলড্রেন থাকে)
    const filteredChildren = item.children
      ? filterSidebarItemsByRole({ items: item.children, userRole, userPermissions })
      : undefined;

    // যদি সাব-মেনু থাকে কিন্তু ইউজারের কোনো সাব-মেনুর এক্সেস না থাকে, তবে প্যারেন্ট মেনু হাইড হবে
    if (item.children && (!filteredChildren || filteredChildren.length === 0)) {
      return acc;
    }

    acc.push({
      ...item,
      children: filteredChildren,
    });

    return acc;
  }, []);
}