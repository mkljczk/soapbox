interface PaginatedSingleResponse<T> {
  previous: (() => Promise<PaginatedSingleResponse<T>>) | null;
  next: (() => Promise<PaginatedSingleResponse<T>>) | null;
  items: T;
  partial: boolean;
  total?: number;
}

type PaginatedResponse<T> = PaginatedSingleResponse<Array<T>>;

export type {
  PaginatedSingleResponse,
  PaginatedResponse,
};
