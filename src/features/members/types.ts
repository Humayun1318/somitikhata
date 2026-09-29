// Shapes returned by the backend member module (bottolisomobai-server).

// Same values as MemberStatus in the backend (member.interface.ts).
export const MEMBER_STATUSES = ["active", "inactive", "suspended", "exited"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];
export type GuardianRelation = "father" | "spouse";

export type Member = {
  _id: string;
  memberNo: string;
  nameBn: string;
  nameEn?: string;
  guardianName?: string;
  guardianRelation?: GuardianRelation;
  phone: string;
  nid: string;
  dob?: string;
  joinDate: string;
  status: MemberStatus;
  exitDate?: string;
  admissionFormNo?: string;
  createdAt?: string;
  updatedAt?: string;
  // The list endpoint fills these in (populate); other endpoints send only the id.
  createdBy?: AuditUser | string;
  updatedBy?: AuditUser | string;
};

export type AuditUser = { _id: string; name: string; email?: string; role?: string };

// QueryBuilder.getMeta() on the backend
export type PaginationMeta = {
  page: number;
  limit: number;
  skip: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
};

// QueryBuilder.execute() on the backend: { meta, data }
export type PaginatedResult<T> = {
  meta: PaginationMeta;
  data: T[];
};

// Fields the backend lets us sort by (member.builder.config.ts sortableFields).
export type MemberSortField = "memberNo" | "nameBn" | "joinDate" | "status";

// What the list page keeps in the URL. Empty string = not set.
export type MemberListParams = {
  page: number;
  limit: number;
  search: string;
  /** "" = all statuses. */
  status: MemberStatus | "";
  /** "", "field" (ascending) or "-field" (descending). "" = backend default (newest first). */
  sort: string;
  startJoinDate: string; // YYYY-MM-DD
  endJoinDate: string; // YYYY-MM-DD
};

// POST /member/create (backend createMemberZodSchema, strict: no extra keys).
export type CreateMemberPayload = {
  nameBn: string;
  nameEn?: string;
  guardianName?: string;
  guardianRelation?: GuardianRelation;
  phone: string;
  nid: string;
  dob?: string;
  joinDate: string;
  admissionFormNo?: string;
  /** Needed when the NID already has a membership (backend answers 409). */
  confirmExtraMembership?: boolean;
};

// PATCH /member/update/:memberNo (backend updateMemberZodSchema: strict,
// every field optional, at least one field required).
export type UpdateMemberPayload = Partial<Omit<CreateMemberPayload, "confirmExtraMembership">>;

// PATCH /member/update-status/:memberNo. exitDate is required for "exited"
// and must be left out for every other status.
export type UpdateMemberStatusPayload = {
  status: MemberStatus;
  exitDate?: string;
};
