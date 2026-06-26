export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export function parsePage(raw: number | undefined): number {
  return Math.max(1, Number(raw) || 1);
}

export function parseLimit(raw: number | undefined): number {
  return Math.min(100, Math.max(1, Number(raw) || 20));
}
