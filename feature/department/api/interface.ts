export interface Department {
  id: number;
  name: string;
  officeId: 1;
  officeName: string;
}

export interface IDepartmentResponse {
  results: Department[];
}
