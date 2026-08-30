import { Role } from './role.enum';

export interface JwtPayload {
  sub: string;
  username: string | null;
  role: Role;
}

export interface AuthenticatedUser {
  id: string;
  username: string | null;
  role: Role;
}
