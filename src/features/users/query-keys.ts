// Every login-account query sits under "users", so one invalidation after a
// status change or password reset refreshes the admin list and member accounts.
export const userKeys = {
  all: ["users"] as const,
  byMember: (memberId: string) => [...userKeys.all, "member", memberId] as const,
};
