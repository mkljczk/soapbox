/**
 * @category Utils
 */
interface PaginatedResponse<T, IsArray extends boolean = true> {
  previous: (() => Promise<PaginatedResponse<T, IsArray>>) | null;
  next: (() => Promise<PaginatedResponse<T, IsArray>>) | null;
  items: IsArray extends true ? Array<T> : T;
  partial: boolean;
  total?: number;
}

export type {
  PaginatedResponse,
};
