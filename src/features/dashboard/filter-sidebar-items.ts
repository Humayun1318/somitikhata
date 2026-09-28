import type { DashboardSidebarItem, UserRole, Permission } from '@/features/dashboard/types';

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
    if (!item.roles.includes(userRole)) {
      return acc;
    }

    // An item is allowed when it has no permissions, when the caller passed no
    // userPermissions (all allowed), or when the user holds at least one of them.
    const hasPermission =
      !item.permissions ||
      userPermissions === undefined ||
      item.permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return acc;
    }

    const filteredChildren = item.children
      ? filterSidebarItemsByRole({
          items: item.children,
          userRole,
          userPermissions,
        })
      : undefined;

    // A parent whose children are all filtered out is hidden too.
    if (item.children && (!filteredChildren || filteredChildren.length === 0)) {
      return acc;
    }

    acc.push({ ...item, children: filteredChildren });

    return acc;
  }, []);
}
