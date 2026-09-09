import type {DashboardSidebarItem, UserRole, Permission } from '@/types/dashboard-sidbar';

type FilterParams = {
  items: DashboardSidebarItem[];
  userRole: UserRole;
  userPermissions?: Permission[];
};

export function filterSidebarItemsByRole({
  items,
  userRole,
  userPermissions,
}: FilterParams): DashboardSidebarItem[] {
  return items.reduce<DashboardSidebarItem[]>((acc, item) => {
    // ১. চেক করুন ইউজার রোল এই মেনুর সাথে মিলে কিনা
    const hasRole = item.roles.includes(userRole);

    if (!hasRole) {
      return acc;
    }

    // ২. পারমিশন ফিল্টারিং:
    // - যদি মেনুতে কোনো permissions না থাকে -> True
    // - যদি userPermissions প্রপস না পাঠানো হয় (undefined) -> True (সব পারমিশন এলাউ করবে)
    // - যদি পারমিশন থাকে -> চেক করবে ইউজারের সেই পারমিশন আছে কিনা
    const hasPermission =
      !item.permissions ||
      userPermissions === undefined ||
      item.permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return acc;
    }

    // ৩. সাব-মেনু ফিল্টারিং (যদি চিলড্রেন থাকে)
    const filteredChildren = item.children
      ? filterSidebarItemsByRole({
          items: item.children,
          userRole,
          userPermissions,
        })
      : undefined;

    // যদি সাব-মেনু কনফিগার করা থাকে কিন্তু কোনো সাব-মেনুর এক্সেস না থাকে, তবে প্যারেন্ট আইটেম হাইড হবে
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