export interface Employee {
  id: string | number;
  name: string;
  lastName: string;
  salary: number;
  department: string;
}

export type CreateEmployeeDto = Omit<Employee, 'id'>;

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}
