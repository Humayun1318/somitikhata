export type ApiEnvelope<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
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
