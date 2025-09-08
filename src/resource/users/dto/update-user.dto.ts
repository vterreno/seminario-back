export interface UpdateUserDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  role_id?: number;
  empresa_id?: number;
  status?: boolean;
}