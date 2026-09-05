export const Role = {
  ADMIN: 'ADMIN',
  USUARIO: 'USUARIO',
  AUDITOR: 'AUDITOR',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
