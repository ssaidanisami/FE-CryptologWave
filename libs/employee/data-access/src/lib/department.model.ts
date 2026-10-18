export interface Department {
  id: string | number;
  name: string;
}

export type CreateDepartmentDto = Omit<Department, 'id'>;
