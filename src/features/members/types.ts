// Shapes returned by the backend member module (bottolisomobai-server).

export type MemberStatus = "active" | "inactive" | "suspended" | "exited";
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
};

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
