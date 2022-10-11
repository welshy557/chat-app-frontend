export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  friends?: User[];
  created_at: string;
  updated_at: string;
}
