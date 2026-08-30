import { Role } from './role.enum';

export interface JwtPayload {
  sub: string;
  username: string;
  role: Role;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: Role;
}
