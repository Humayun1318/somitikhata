export const nomineeKeys = {
  all: ["nominees"] as const,
  byMember: (memberNo: string) => [...nomineeKeys.all, "member", memberNo] as const,
  mine: () => [...nomineeKeys.all, "mine"] as const,
};
