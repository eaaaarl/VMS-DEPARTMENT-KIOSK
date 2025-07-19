export interface Department {
  id: number;
  name: string;
  officeId: number;
  officeName: string;
}

export interface IDepartmentResponse {
  results: Department[];
}
